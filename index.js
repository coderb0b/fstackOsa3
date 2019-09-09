const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())

morgan.token('body', function (req, res) {
  return JSON.stringify(req.body)
})

app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

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

app.get('/', (req, res) => {
  res.send('<div>Hello World</div>')
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(p => p.id === id)
  
  if (person) {
	  res.json(person)
  } else {
	  res.status(404).end()
  }
})

app.post('/api/persons', (req, res) => {
	const body = req.body
	
	if (!body.name || !body.number) {
		return res.status(400).json({
			error: 'missing content'
		})
	}
	
	const person = {
		name: body.name,
		number: body.number,
		id: Math.floor(Math.random() * 10000),
	}
	
	if (persons.find(p => p.name === person.name)) {
		return res.status(400).json({
			error: 'name must be unique'
		})
	}
	
	persons = persons.concat(person)
	res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(p => p.id !== id)
  
  res.status(204).end()
})

app.get('/info', (req, res) => {
	res.send(`<div>Phonebook has info for ${persons.length} people <br />${Date()}</div>`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})