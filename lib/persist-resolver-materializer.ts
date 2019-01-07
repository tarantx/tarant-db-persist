import { Actor, ActorMessage, IMaterializer, IResolver } from 'tarant'
import { IActor } from 'tarant/dist/actor-system/actor'
import Waterline from 'waterline'
import actorConfig from '../lib/actor-model.json'

export default class PersistResolverMaterializer implements IMaterializer, IResolver {
  public static create(config: any, types: any): Promise<PersistResolverMaterializer> {
    return new Promise((resolve, rejects) => {
      const actorModel = Waterline.Collection.extend(actorConfig)
      const waterline = new Waterline()
      waterline.registerModel(actorModel)
      waterline.initialize(config, (err: any, ontology: any) => {
        if (err) {
          rejects(err)
        }
        else {
          resolve(new PersistResolverMaterializer(ontology.collections.actor, types))
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
    // console.log("id to search: " + id)
    const result = await this.actorModel.findOne({ id })
    // console.log("found: " + result)
    if (!result) {
      return Promise.reject('not found')
    }
    const actor = new this.types[result.type](id)
    actor.updateFrom(result)
    return Promise.resolve(actor)
  }
  private async createOrUpdate(actor: Actor) {
    const record = await (actor as any).toJson()
    // console.log("from json: " + record.id)
    if (await this.actorModel.findOne({ id: record.id })) {
      await this.actorModel.updateOne({ id: record.id }).set(record)
    }
    else {
      await this.actorModel.create(record)
    }
  }
}
