# ![logomakr_8lsyys](https://user-images.githubusercontent.com/3071208/50820118-329ab800-132c-11e9-98d9-eac3805765ae.png)


[![npm](https://img.shields.io/npm/v/tarant-db-persist.svg)](https://www.npmjs.com/package/tarant-db-persist)
[![Build Status](https://travis-ci.org/tarantx/tarant-db-persist.svg?branch=master)](https://travis-ci.org/tarantx/tarant-db-persist)
[![Coverage Status](https://coveralls.io/repos/github/tarantx/tarant-db-persist/badge.svg?branch=master)](https://coveralls.io/github/tarantx/tarant-db-persist?branch=master)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![issues Welcome](https://img.shields.io/badge/issues-welcome-brightgreen.svg)
![npm](https://img.shields.io/npm/l/tarant-db-persist.svg)
![GitHub issues](https://img.shields.io/github/issues/tarantx/tarant-db-persist.svg)
![GitHub pull requests](https://img.shields.io/github/issues-pr/tarantx/tarant-db-persist.svg)
![Downloads](https://img.shields.io/npm/dt/tarant-db-persist.svg)

## Motivation

Provide the capabilities to actors on the backend to be persisted using waterline adapters.

## Installation

add it to your project using `npm install tarant-db-persist --save` or `yarn add tarant-db-persist`

## Usage

Initialize the sync client with the waterline adapter from the persist storage you will be interested on

```js
import { ActorSystem, ActorSystemConfigurationBuilder } from 'tarant';
import * as diskAdapter from 'sails-disk';
import { PersistResolverMaterializer } from 'tarant-db-persist';
import AppActor from '../AppActor';

const config = {
    adapter: {
        type: diskAdapter,
        settings: {
          inMemoryOnly: true
        },
      },
      actorTypes: { AppActor }
  };

const persister = await PersistMaterializer.create(config)

const system : any = ActorSystem.for(ActorSystemConfigurationBuilder.define()
    .withMaterializers([persister])
    .withResolvers([persister])
    .done())  

```

your actors will require to implement IUpdatable (UpdateFrom) and IExportable (toJson)

```js
import { Actor } from "tarant";
import { IUpdatable, IExportable } from "tarant-db-persist"

export default class AppActor extends Actor implements IUpdatable, IExportable {

  constructor(name: string) {
      super(name)
  }

  addOne() {
      this.counter++
  }

  toJson(){
        return {
            id: this.id,
            type:"AppActor",
            counter: this.counter
        }
    }

    updateFrom({ counter }: any): void {
        this.counter = counter
    }

    private counter = 1; 
}

```

##### Created my free [logo](https://logomakr.com/8lSyYS) at <a href="http://logomakr.com" title="Logo Makr">LogoMakr.com</a> 

