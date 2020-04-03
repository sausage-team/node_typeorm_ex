const account: {
  msg_id: string,
  msg_app_secret: string,
  endpoint: string,
  api_version: string,
  sign_name: string,
  template_code: string,
  template_params: Function
} = {
  msg_id: 'LTAIvnDFlCG6YfGc',
  msg_app_secret: '',
  endpoint: 'https://dysmsapi.aliyuncs.com',
  api_version: '2017-05-25',
  sign_name: '杨灯',
  template_code: '',
  template_params: (code: string): string => {
    return `{'code': ${code}}`
  }
}

export const EXPIRED_TIME = 5 * 60 * 1000

export const RedisHashKey = {
  SMS: 'short_message_service'
}

export default account
