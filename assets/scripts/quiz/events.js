'use strict'

const api = require('./api')
const questionApi = require('../question/api')
const ui = require('./ui')
const store = require('../store')
const getFormFields = require('../../../lib/get-form-fields')

// TODO:
// create a function that checks if date is in the past or future
// if in the future, throw an error message

// Create

const onShowCreateQuiz = event => {
  event.preventDefault()

  ui.onShowCreateQuizSuccess()
}

const onCreateQuiz = event => {
  event.preventDefault()
  const form = event.target
  const formData = getFormFields(form)

  // onCreateQuiz stores the quiz data in empty quizData in ../store.js
  // console.log('formData is ', formData)
  api.createQuiz(formData)
    .then(res => store.quizData.push(res.quiz))
    .then(ui.onCreateQuizSuccess)
    .catch(console.error)
}

const onFinishQuiz = event => {
  event.preventDefault()
  // console.log('quizData: ', store.quizData)
  api.finishQuiz()
    .then(ui.onFinishQuizSuccess)
    .then(onGetAllQuizzes(event))
    .catch(console.error)
}

// Read

const onGetOneQuiz = event => {
  event.preventDefault()

  const quizId = $(event.target).data('id')
  // console.log(quizId)

  api.getOneQuiz(quizId)
    .then(ui.onGetOneQuizSuccess)
    .catch(console.error)
}

const onShowScheduleClassrooms = () => {
  event.preventDefault()

  api.getMyClassrooms()
    .then(ui.onShowScheduleClassroomsSuccess)
}

// Update

const onShowEditQuiz = event => {
  event.preventDefault()
  // calls editQuiz ui
  // ui will hide teacher dash and show edit quiz form
  const quizId = $(event.target).data('id')

  api.getOneQuiz(quizId)
    .then(ui.onGetOneQuizEditSuccess)
    .catch(console.error)
}

const onEditQuiz = event => {
  event.preventDefault()

  const quizId = store.quizData._id

  const form = event.target
  const formData = getFormFields(form)
  // as part of this API call, when editQuiz is successful, we want to call
  // getOneQuiz, and store the response in store.quizData
  api.editQuiz(quizId, formData)
    .then(api.getOneQuiz(quizId)
      .then(ui.onEditQuizSuccess))
    .catch(console.error)
}

const onFinishQuizEdit = event => {
  event.preventDefault()
  ui.onFinishQuizEditSuccess()
  // event.preventDefault()
  // console.log('quizData: ', store.quizData.quiz._id)
  // console.log('store.questions: ', store.questions)
  // api.updateQuestionsInQuiz()
  //   .then(ui.onFinishQuizSuccess)
  //   .then(onGetAllQuizzes(event))
  //   .catch(console.error)
}

// onEditQuizSuccess will have to lead directly into editQuestion
const onEditQuizSchedule = event => {
  event.preventDefault()

  const quizId = $('.single-quiz').data('id')
  // console.log('quizId: ', quizId)

  const form = event.target
  const formData = getFormFields(form)

  // as part of this API call, when editQuiz is successful, we want to call
  // getOneQuiz, and store the response in store.quizData
  api.editQuiz(quizId, formData)
    .then(ui.onEditQuizScheduleSuccess)
    .catch(console.error)
}

// Destroy

// get one quiz
// if quiz owner is user id
// loop through res.questions
// call delete question on each
// then delete quiz
const onDeleteQuiz = event => {
  event.preventDefault()

  const quizId = $(event.target).data('id')
  api.getOneQuiz(quizId)
    .then(res => {
      if (res.quiz.owner === store.user._id) {
        const questions = res.quiz.questions
        // console.log('questions: ', questions)
        for (let i = 0; i < questions.length; i++) {
          if (!questions[i].questionOwner) {
            questionApi.deleteQuestion(questions[i]._id)
          }
        }
      } else {
        console.log('you dont own this')
      }
    })
  api.getOneQuiz(quizId)
    .then(res => {
      if (res.quiz.owner === store.user._id) {
        api.deleteQuiz(quizId)
          .then(data => {
            onGetAllQuizzes(event)
          })
      }
    })
}

// misc

const onScheduleQuizToClassroom = () => {
  event.preventDefault()
  const classId = $(event.target).data('id')
  const quizId = store.quizData.quiz._id
  // console.log('class ', classId)
  // console.log('quiz ', quizId)

  api.addClassroomToQuiz(quizId, classId)
    .then(console.log)
    .catch(console.error)

  api.addQuizToClassroom(quizId, classId)
    .then(console.log)
    .catch(console.error)
}

const onSingleQuizToTeacherDash = () => {
  event.preventDefault()

  ui.onSingleQuizToTeacherDashSuccess()
}

// Function to get all quizes after deletion / edit
const onGetAllQuizzes = event => {
//  event.preventDefault()
  // const userId = store.user._id

  api.getAllQuizzes()
    .then(ui.onGetAllQuizzesSuccess)
    .catch(console.error)
}

const addHandlers = event => {
  // Create Req
  $('.create-quiz-button').on('click', onShowCreateQuiz)
  $('.create-quiz').on('submit', '#create-quiz', onCreateQuiz)
  $('.create-question').on('click', '.finish-quiz', onFinishQuiz)

  // Read Req
  // need to edit once handlebars is integrated
  $('.quiz-listing').on('click', '.single-quiz-link', onGetOneQuiz)
  $('#single-quiz-listing').on('click', '.classroom-list-schedule', onShowScheduleClassrooms)

  // Update Req
  $('.quiz-listing').on('click', '.edit-quiz-link', onShowEditQuiz)
  $('#single-quiz-listing').on('submit', '#edit-quiz', onEditQuiz)
  $('#edit-single-question').on('click', '.finish-quiz-edits', onFinishQuizEdit)
  $('#single-quiz-listing').on('submit', '.schedule-quiz', onEditQuizSchedule)

  // $('.edit-quiz').on('submit', onEditQuiz)

  // Destroy Req
  $('.quiz-listing').on('click', '.delete-quiz', onDeleteQuiz)

  // Misc
  $('#single-quiz-listing').on('click', '.classname-schedule', onScheduleQuizToClassroom)
  $('#single-quiz-listing').on('click', '.quiz-to-teacher-dash', onSingleQuizToTeacherDash)
}

module.exports = {
  addHandlers,
  onGetAllQuizzes
}
