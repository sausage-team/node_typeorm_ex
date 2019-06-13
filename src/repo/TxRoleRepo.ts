import { Repository, TransactionRepository, Transaction } from "typeorm"
import { TxRole } from "../entity/TxRole"

export class TxRoleRepo {
  @Transaction()
  public async updaterepo (role: TxRole, @TransactionRepository(TxRole) repo: Repository<TxRole>) {
  }
}