import {getRepository} from 'typeorm'
import {NextFunction, Request, Response} from 'express'
import * as redis from 'redis'
import * as bluebird from 'bluebird'
import {createClient} from 'redis'
import {User} from '../entity/User'
import account from '../bean'
import { RedisHashKey, EXPIRED_TIME } from '../bean'
import { Controller, Get, Post, Delete} from '../decorators'
import Util from '../util'

const Core = require('@alicloud/pop-core')
const crypto = require('crypto')
const token = require('../util/token')

bluebird.promisifyAll(redis)

@Controller('/api/users')
export class UserController {
	private redisClient: any = createClient()

	public client: any = new Core({
		accessKeyId: account.msg_id,
		accessKeySecret: account.msg_app_secret,
		endpoint: account.endpoint,
		apiVersion: account.api_version
	})

	private userRepository = getRepository(User)

	@Get('/send_msg')
	public async send_msg(request: Request, response: Response, next: NextFunction) {

		const code = Math.random().toString().slice(-6)
		const params: any = {
			PhoneNumbers: request.query.phone,
			SignName: account.sign_name,
			TemplateCode: account.template_code,
			TemplateParam: account.template_params(code)
		}
		const request_option: any = {
			method: 'POST'
		}
		let response_data !: any

		try {
			response_data = await this.client.request('SendSms', params, request_option)
		} catch (err) {
			return {
				status: 1,
				msg: err.data.Message
			}
		}
		if (response_data.Code === 'OK') {
			this.redisClient.setAsync(`${RedisHashKey.SMS}:${request.query.phone}`,
				JSON.stringify({
					code: code,
					expired: new Date().getTime() + EXPIRED_TIME,
					checked: false
				}),'EX', 100).then((ret: any) => {
			})
			return {
				status: 0,
				msg: 'OK'
			}
		} else {
			return {
				status: 1,
				msg: 'Error'
			}
		}
	}

	@Get('/check_code')
	public async check_code(request: Request, response: Response, next: NextFunction) {
		const params: any = {
			PhoneNumber: request.query.phone,
			SendDate: Util.getDate(),
			PageSize: 10,
			CurrentPage: 1
		}

		const {code, phone} = request.query

		const requestOption = {
			method: 'POST'
		}

		await new Promise((resolve: any, reject: any) => {
			this.client.request('QuerySendDetails', params, requestOption).then((result: any) => {
				const {Code, SmsSendDetailDTOs} = result
				if (Code === 'OK') {
					const res = SmsSendDetailDTOs.SmsSendDetailDTO
					if (res && res.length > 0) {
						const new_code = Util.getCode(res[0].Content)
						let response_data !: any
						this.redisClient.get(`${RedisHashKey.SMS}:${phone}`, (err: any, ret: any) => {
							let redis_data !: any
							try {
								redis_data = JSON.parse(ret)
								if (redis_data.expired < new Date().getTime()) {
									response_data = {
										status: 4,
										msg: '验证码已失效，请重新获取'
									}
								} else {
									if (redis_data.code === new_code) {
										if (redis_data.checked) {
											response_data = {
												status: 2,
												msg: '验证码已被使用，请重新获取'
											}
										} else {
											response_data = {
												status: 0,
												msg: '验证码正确'
											}
											this.redisClient.set(`${RedisHashKey.SMS}:${request.query.phone}`, 
												JSON.stringify({
													...redis_data,
													checked: true
												}
											),
											'EX', 100)
										}
									} else {
										response_data = {
											status: 1,
											msg: '验证码错误'
										}
									}
								}
							} catch (e) {
								response_data = {
									status: 3,
									msg: '验证码未发送，请重新获取'
								}
							}
							resolve(response_data)
						})
					}
				}
			})
		})
	}

	@Get('/')
	public async all(request: Request, response: Response, next: NextFunction) {
		return this.userRepository.find()
	}

	@Post('/sign')
	public async login(request: Request, response: Response, next: NextFunction) {
		const username = request.body.username
		const password = crypto.createHash('sha1').update(request.body.password).digest('hex')

		const res_by_username = await this.userRepository.find({
			username: username
		})

		if (res_by_username && res_by_username.length === 1) {
			if (password === res_by_username[0].password) {
				const result = {
					...res_by_username[0],
					password: undefined
				}
				const access_token = token.createToken(JSON.stringify(result), 3 * 60 * 60 * 1000)
				response.cookie('Access_token', access_token, {
					domain: Util.GetDomainName(request.headers.origin),
					path: '/',
					maxAge: 3 * 60 * 60 * 1000
				})

				return {
					status: 0,
					msg: '登录成功',
					data: {
						...result,
						access_token
					}
				}
			} else {
				return {
					status: 1,
					msg: '密码错误'
				}
			}
		} else {
			return {
				status: 1,
				msg: '用户名不存在'
			}
		}
		

	}

	public async one(request: Request, response: Response, next: NextFunction) {
		return this.userRepository.findOne(request.params.id)
	}

	@Post('/')
	public async save(request: Request, response: Response, next: NextFunction) {
		const password = crypto.createHash('sha1').update(request.body.password).digest('hex')

		const phone = request.body.phone
		this.redisClient.getAsync(`${RedisHashKey.SMS}:${phone}`).then((ret: any) => {
			if (ret === null) {
				console.log('empty catch')
			} else {
				const validata: any = JSON.parse(ret)
				this.redisClient.del(`${RedisHashKey.SMS}:${phone}`, (err:any) => null)
			}
		})

		const res_by_username = await this.userRepository.find({
			username: request.body.username
		})

		const res_by_phone = await this.userRepository.find({
			phone: request.body.phone
		})
		
		return new Promise(resolve => {
			if (res_by_username && res_by_username.length > 0) {
				resolve({
					status: 1,
					msg: '用户名已被注册'
				})
			} else if (res_by_phone && res_by_phone.length > 0) {
				resolve({
					status: 1,
					msg: '手机号已被注册'
				})
			} else {
				this.userRepository.save({
					...request.body,
					password
				}).then(res => {
					resolve({
						status: 0,
						msg: 'ok'
					})
				}).catch(err => {
					resolve({
						status: 1,
						msg: 'error'
					})
				})
			}
		})
	}

	@Delete('/:id')
	public async remove(request: Request, response: Response, next: NextFunction) {
		let userToRemove = await this.userRepository.findOne(request.params.id)
		await this.userRepository.remove(userToRemove)
	}

}