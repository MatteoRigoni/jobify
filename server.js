import express from 'express'
import dotenv from 'dotenv'

import errorHanderMiddleware from './middleware/error-handler.js'
import notFoundMiddleware from './middleware/not-found.js'
import connectionDB from './db/connect.js'
import authRouter from './routes/authRoutes.js'
import jobsRouter from './routes/jobsRouter.js'
import 'express-async-errors' // to avoid try-catch with next
import cors from 'cors'
import morgan from 'morgan'
import authenticateUser from './middleware/auth.js'
import helmet from 'helmet'
import xss from 'xss-clean'
import mongoSanitize from 'express-mongo-sanitize'

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'

const app = express()
dotenv.config()

app.use(cors())

app.use(express.json())

app.use(express.json())
app.use(helmet())
app.use(xss())
app.use(mongoSanitize())

// only when ready to deploy
const __dirname = dirname(fileURLToPath(import.meta.url))
app.use(express.static(path.resolve(__dirname, './client/build')))

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'))
}

app.get('/', (req, res) => {
  res.json({msg: 'Welcome!' })
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser, jobsRouter)

// only when ready to deploy
app.get('*', function (request, response) {
    response.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
})

app.use(notFoundMiddleware)
app.use(errorHanderMiddleware)

const port = process.env.PORT || 5000

const start = async () => {
    try {
        await connectionDB(process.env.MONGO_URL)
        app.listen(port, () => console.log(`Server is listening on port ${port}...`))
    } catch (error) {
        console.log(error)
    }
}

start()