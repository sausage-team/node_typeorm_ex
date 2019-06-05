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
  msg_app_secret: '7IeTftOJUT0DoRc550UF1xQJnB8koF',
  endpoint: 'https://dysmsapi.aliyuncs.com',
  api_version: '2017-05-25',
  sign_name: '杨灯',
  template_code: 'SMS_141505013',
  template_params: (code: string): string => {
    return `{"code": ${code}}`
  }
}

export default account