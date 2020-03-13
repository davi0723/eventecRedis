# eventecRedis

eventec redis get getJson pub sub by andriod
## before install 
### you need install  **vue**, **vue-router** and **vuex** first

## install

```
   npm i -S eventecredis
```

## usage

```
    import eventecredis from 'eventecredis'
    Vue.use(eventecredis, options)
```

## options

```
    retquired : fasle,
    type : Object,
    eg : {
        taskExecSpeed : 500 //taskList exec speed,
        fn(a){ // a : '{ "view":"Ship/BrewProgress", "freezing_time" :7000 }'
            const { view, id, variables } = a;
            let url = "/" + view;
            if (id) {
                url += "/" + id;
            }
            return {
                path: url,
                query: variables
            };
        }
    }
```

eg
