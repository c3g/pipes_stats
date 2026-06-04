import configureStoreDev from './store.dev'
import configureStoreProd from './store.prod'

export default process.env.NODE_ENV === 'production' ? configureStoreProd : configureStoreDev
