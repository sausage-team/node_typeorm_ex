// import {UserController} from "./controller/UserController";

// export const Routers = {
// 	users: {
// 		controller: UserController,
// 		gateways: [
// 			{
// 				path: '/',
// 				method: 'get',
// 				action: 'all'
// 			},
// 			{
// 				path: '/',
// 				method: 'post',
// 				action: 'save'
// 			},
// 			{
// 				path: '/sign',
// 				method: 'post',
// 				action: 'login'
// 			},
// 			{
// 				path: '/:id',
// 				method: 'delete',
// 				action: 'remove'
// 			},
// 			{
// 				path: '/send_msg',
// 				method: 'get',
// 				action: 'send_msg'
// 			},
// 			{
// 				path: '/check_code',
// 				method: 'get',
// 				action: 'check_code'
// 			}
// 		]
// 	} 
// }



import { UserController } from "./controller/UserController";
import { ClassKeys } from './decorators/decorator'

type Controller = InstanceType<any>;

function getRouter (controllerClz: Controller): any {
    const routers = []
    const prototype = controllerClz.prototype
    const basePath = Reflect.getOwnMetadata(ClassKeys.BasePath, controllerClz);
    const members = Object.getOwnPropertyNames(prototype)
  
    members.forEach((member) => {
      const route = prototype[member];
      const routeProperties = Reflect.getOwnMetadata(member, prototype);
  
      if (route && routeProperties) {
          const { httpVerb, path } = routeProperties;
  
          routers.push({
            method: httpVerb,
            route: `${basePath}${path}`,
            controller: controllerClz,
            action: member
          })
      }
    });
    console.log(routers)
    return routers
}

export const Routers = getRouter(UserController)