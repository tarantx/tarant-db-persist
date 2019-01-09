import { Actor, ActorMessage, IMaterializer, IResolver } from 'tarant'
import { IActor } from 'tarant/dist/actor-system/actor'
import Waterline from 'waterline'
import actorConfig from '../lib/actor-model.json'

export default class PersistResolverMaterializer implements IMaterializer, IResolver {
  public static create(config: any): Promise<PersistResolverMaterializer> {
    return new Promise((resolve, rejects) => {
      const actorModel = Waterline.Collection.extend(actorConfig)
      const waterline = new Waterline()
      const dbConfig = {
        adapters: {
          adapt: config.adapter,
        },
        datastores: {
          default: {
            adapter: 'adapt',
            inMemoryOnly: true,
          },
        },
      }
      waterline.registerModel(actorModel)
      waterline.initialize(dbConfig, (err: any, ontology: any) => {
        if (err) {
          rejects(err)
        } else {
          resolve(new PersistResolverMaterializer(ontology.collections.actor, config.actorTypes))
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
    const record = await (actor as any).toJson()
    await this.actorModel.findOrCreate({ id: record.id }, record)
  }

  public onBeforeMessage(actor: Actor, message: ActorMessage): void {
    //
  }

  public async onAfterMessage(actor: Actor, message: ActorMessage): Promise<void> {
    let record = await (actor as any).toJson()
    const dbRecord = await this.actorModel.findOne({ id: record.id })
    record = Object.keys(dbRecord).reduce((acc, key) => {
      return { ...acc, [key]: record[key] || null }
    }, {})
    await this.actorModel.updateOne({ id: record.id }).set(record)
  }

  public onError(actor: Actor, message: ActorMessage, error: any): void {
    //
  }

  public async resolveActorById(id: string): Promise<IActor> {
    const result = await this.actorModel.findOne({ id })
    if (!result) {
      return Promise.reject('actor not found')
    }
    const actor = new this.types[result.type](id)
    actor.updateFrom(result)
    return Promise.resolve(actor)
  }
}
