require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('body', function (req, res) {
  return JSON.stringify(req.body)
})

app.use(cors())
app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('build'))

/* MongoDB käytössä
let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    }
]
*/

app.get('/', (req, res) => {
  res.send('<div>api/persons</div>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
	  res.json(persons)
  })  
})

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id)
	.then(person => {
		if (person) {
			res.json(person.toJSON())
		} else {
			res.status(404).end()
		}
	})
	.catch(error => {
		console.log(error)
		res.status(400).send({ error: 'malformed id' })
	})
})

app.post('/api/persons', (req, res) => {
	const body = req.body
	
	if (body.name === undefined || body.number === undefined) {
		return res.status(400).json({
			error: 'missing content'
		})
	}
	
	const person = new Person ({
		name: body.name,
		number: body.number,
	})

/*	Tarkistetaan onko saman nimistä henkilöä, lisätään myöhemmin
	if (persons.find(p => p.name === person.name)) {
		return res.status(400).json({
			error: 'name must be unique'
		})
	}
*/
	person.save().then(savedPerson => {
		res.json(savedPerson.toJSON())
	})
	
})

app.delete('/api/persons/:id', (req, res, next) => {
	Person.findByIdAndRemove(req.params.id)
		.then(result => {
			res.status(204).end()
		})
		.catch(error => next(error))
  
})

app.put('/api/persons/:id', (req, res, next) => {
	const body = req.body

	const person = {
		name: body.name,
		number: body.number,
	}

	Person.findByIdAndUpdate(req.params.id, person, { new: true })
	  .then(updatedPerson => {
		  res.json(updatedPerson.toJSON())
	  })
	  .catch(error => next(error))
})

app.get('/info', (req, res) => {
	Person.find({}).then(persons => {
		res.send(`<div>Phonebook has info for ${persons.length} people <br />${Date()}</div>`)
	})
})

//virheiden käsittely
const unknownEndpoint = (req, res) => {
	console.log("not found error")
	res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
	console.log(error.message)

	if (error.name === 'CastError' && error.kind == 'ObjectId') {
		return res.status(400).send({ error: 'malformed id' })
	}
	next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})