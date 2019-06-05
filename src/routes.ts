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