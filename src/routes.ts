import {UserController} from "./controller/UserController";

export const Routers = {
	users: {
		controller: UserController,
		gateways: [
			{
				path: '/',
				method: 'get',
				action: 'all'
			},
			{
				path: '/',
				method: 'post',
				action: 'save'
			},
			{
				path: '/sign',
				method: 'post',
				action: 'login'
			},
			{
				path: '/:id',
				method: 'delete',
				action: 'remove'
			},
			{
				path: '/send_msg',
				method: 'get',
				action: 'send_msg'
			},
			{
				path: '/check_code',
				method: 'get',
				action: 'check_code'
			}
		]
	} 
}