import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {createClient} from 'redis'
import {User} from "../entity/User";
import account from '../bean'
import { RedisHashKey } from '../bean'
import Util from '../util'

const Core = require('@alicloud/pop-core');
const crypto = require('crypto');
const token = require('../util/token');

const select_code_count = {}

export class UserController {
	private redisClient: any = createClient()

	public client: any = new Core({
		accessKeyId: account.msg_id,
		accessKeySecret: account.msg_app_secret,
		endpoint: account.endpoint,
		apiVersion: account.api_version
	})

	private userRepository = getRepository(User);

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
	
		return Util.response_manage(
			this.client.request('SendSms', params, request_option),
			(result: any) => {
				this.redisClient.set(`${RedisHashKey.SMS}:${request.query.phone}`, 
					JSON.stringify({
						code: code,
						expired: 0
					}),
				'EX', 100) // 100 seconds expired
				select_code_count[request.query.phone] = {}
				return result
			}
		)
	}

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

		return new Promise((resolve: any, reject: any) => {
			this.client.request('QuerySendDetails', params, requestOption).then((result: any) => {
				const {Code, SmsSendDetailDTOs} = result
				if (Code === 'OK') {
					const res = SmsSendDetailDTOs.SmsSendDetailDTO
					if (res && res.length > 0) {
						const new_code = Util.getCode(res[0].Content)
						if (code === new_code) {
							if(new Date().getTime() - new Date(res[0].ReceiveDate).getTime() > 5 * 60 * 1000) {
								resolve({
									status: 4,
									msg: "验证码已失效，请重新获取"
								})
							} else {
								if(!select_code_count[phone] || !select_code_count[phone][code] ) {
									resolve({
										status: 0,
										msg: "验证码正确"
									})
									if(!select_code_count[phone]) {
										select_code_count[phone] = {};
									}
									select_code_count[phone][code] = true;
								} else {
									resolve({
										status: 4,
										msg: "验证码已被使用，请重新获取"
									})
								}
							}
						} else {
							resolve({
								status: 1,
								msg: "验证码错误"
							})
						}
					} else {
						resolve({
							status: 1,
							msg: "验证码未发送"
						})
					}
				}

			}, (error: any) => {
				console.log(error)
			})
		})
	}

	public async all(request: Request, response: Response, next: NextFunction) {
		return this.userRepository.find();
	}

	public async login(request: Request, response: Response, next: NextFunction) {
		const username = request.body.username
		const password = crypto.createHash('sha1').update(request.body.password).digest('hex')

		this.redisClient.set(`${RedisHashKey.SMS}:${request.query.phone}`, JSON.stringify({
			code: '123456',
			expired: 0
		}),'EX', 100)

		const res_by_username = await this.userRepository.find({
			username: username
		})

		return new Promise((resolve: any) => {
			if (res_by_username && res_by_username.length === 1) {
				if (password === res_by_username[0].password) {
					const result = {
						...res_by_username[0],
						password: undefined
					}
					const access_token = token.createToken(JSON.stringify(result), 10 * 60 *60)
					response.cookie('Access_token', access_token, {
						domain: Util.GetDomainName(request.headers.origin),
						path: '/',
						maxAge: 5000000
					})
					resolve({
						status: 0,
						msg: '登录成功',
						data: {
							...result,
							access_token
						}
					})
				} else {
					resolve({
						status: 1,
						msg: '密码错误'
					})
				}
			} else {
				resolve({
					status: 1,
					msg: '用户名不存在'
				})
			}
		})

	}

	public async one(request: Request, response: Response, next: NextFunction) {
		return this.userRepository.findOne(request.params.id);
	}

	public async save(request: Request, response: Response, next: NextFunction) {
		const password = crypto.createHash('sha1').update(request.body.password).digest('hex')

		const phone = request.body.phone
		this.redisClient.get(`${RedisHashKey.SMS}:${phone}`, (err: any, ret: any) => {
			if (ret === null) {
				console.log('empty catch')
			} else {
				const validata: any = JSON.parse(ret)
				this.redisClient.del(`${RedisHashKey.SMS}:${phone}`, (err:any) => null)
				// check your code
				console.log(validata)
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

	public async remove(request: Request, response: Response, next: NextFunction) {
		let userToRemove = await this.userRepository.findOne(request.params.id);
		await this.userRepository.remove(userToRemove);
	}

}