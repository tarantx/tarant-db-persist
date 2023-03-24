import { Actor, ActorMessage, IMaterializer, IResolver } from 'tarant'
import { IActor } from 'tarant/dist/actor-system/actor'
import equal from 'fast-deep-equal'
import Waterline from 'waterline'

export default class PersistMaterializer implements IMaterializer, IResolver {
  public static create(config: any, types: any): Promise<PersistMaterializer> {
    return new Promise((resolve, rejects) => {
      const actorModel = Waterline.Collection.extend({
        attributes: {
          id: { type: 'string', required: true },
          type: { type: 'string' },
        },
        datastore: 'default',
        identity: 'actor',
        primaryKey: 'id',
        schema: false,
      })
      const waterline = new Waterline()
      waterline.registerModel(actorModel)
      waterline.initialize(config, (err: any, ontology: any) => {
        if (err) {
          rejects(err)
        } else {
          resolve(new PersistMaterializer(ontology.collections.actor, types))
        }
      })
    })
  }
  private actorModel: any
  private types: any

  protected constructor(actorModel: any, types: any) {
    this.actorModel = actorModel
    this.types = types
  }

  public async onInitialize(actor: Actor): Promise<void> {
    await this.createOrUpdate(actor)
  }
  public onBeforeMessage(actor: Actor, message: ActorMessage): void {
    //
  }
  public async onAfterMessage(actor: Actor, message: ActorMessage): Promise<void> {
    await this.createOrUpdate(actor)
  }
  public onError(actor: Actor, message: ActorMessage, error: any): void {
    //
  }

  public async resolveActorById(id: string): Promise<IActor> {
    const result = await this.actorModel.findOne({ id })
    if (!result) {
      return Promise.reject('Actor not found')
    }
    const actor = new this.types[result.type](id)
    actor.updateFrom(result)
    return Promise.resolve(actor)
  }

  private async createOrUpdate(actor: Actor) {
    const record = await (actor as any).toJson()
    const dbRecord = await this.actorModel.findOne({ id: record.id })
    if (equal(record, dbRecord)) return
    if (dbRecord) {
      await this.actorModel.updateOne({ id: record.id }).set({ ...record, id: undefined })
    } else {
      await this.actorModel.create(record)
    }
  }
}
