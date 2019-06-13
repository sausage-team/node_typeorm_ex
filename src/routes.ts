import { ClassKeys } from './decorators'
import { TxController } from './controller/TxController'
import { UserController } from './controller/UserController'

type Controller = InstanceType<any>

function getRouter (controllers: Controller[]): any {
    const routers = []
    controllers.forEach((controller: Controller) => {
      const prototype = controller.prototype
      const basePath = Reflect.getOwnMetadata(ClassKeys.BasePath, controller)
      const members = Object.getOwnPropertyNames(prototype)
    
      members.forEach((member) => {
        const route = prototype[member]
        const routeProperties = Reflect.getOwnMetadata(member, prototype)
    
        if (route && routeProperties) {
            const { httpVerb, path } = routeProperties
    
            routers.push({
              method: httpVerb,
              route: `${basePath}${path}`,
              controller: controller,
              action: member
            })
        }
      })
    })
    return routers
}

export const Routers = getRouter([UserController, TxController])