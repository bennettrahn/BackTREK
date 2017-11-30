// Vendor Modules
import $ from 'jquery';
import _ from 'underscore';

// CSS
import './css/foundation.css';
import './css/style.css';

import TripList from './app/collections/trip_list';
import Trip from './app/models/trip';
import Reservation from './app/models/reservation'

const tripList = new TripList();
let tripTemplate;
let tripDetails;
let registrationTemplate;
const tripFields = ['name', 'continent', 'category', 'cost', 'weeks', 'about'];
const reservationFields = ['name', 'email', 'age']

const render = function render(event) {
  const tableElement = $('#trip-list');
  tableElement.html('');

  tripList.forEach((trip) => {
    if (!trip.get('id')) {
      console.log('this is a bad trip');
      console.log(trip);
    } else {
      const generatedHTML = tripTemplate(trip.attributes);
      tableElement.append(generatedHTML);
    }
  });
};

const showTrips = function showTrips(event) {
  $('#trips-table').show();
  $('.centerbutton').hide();
};

const showTripDetails = function showTripDetails(event) {
  const trip = tripList.get($(this).attr('data-id'))

  trip.fetch({
    success: (model, response) =>{
      // console.log('trip fetch success');
      const generatedHTML = tripDetails(trip.attributes);
      $('#trip-details').html(generatedHTML)
    },
    failure: (model, response) => {
      console.log('trip fetch failure');
      reportStatus('success', 'Trip temporarilty unavailable');
    }
  });
};

const loadRegistrationForm = function loadRegistrationForm(event) {
  const tripId = {tripId: $(this).attr('data-id')}
  const generatedHTML = registrationTemplate(tripId);
  $('.sign-up').hide();
  $('#trip-details').append(generatedHTML);
};

const loadModal = function loadModal(event) {
  $('#add-trip').show();
};

const makeObject = function makeObject(fields) {
  const objectData = {};
  fields.forEach((field) => {
    const inputElement = $(`#add-trip-form input[name="${ field }"]`);
    const value = inputElement.val();
    objectData[field] = value;

    inputElement.val('');
  });
  return objectData
};

const addReservationHandler = function addReservationHandler(event) {
  event.preventDefault();


  const reservation = new Reservation(makeObject(reservationFields));

  console.log('inReservationHanlder');
  console.log(this);
  reservation.tripId =$(this).attr('data-id')

  console.log(reservation);

  // if (!reservation.isValid()) {
  //   handleValidationFailures(reservation.validationError);
  //   return;
  // }

  reservation.save({}, {
    success: (model, response) => {
      console.log(model);
      reportStatus('success', 'Successfully reserved spot on trip')
    },
    error: (model, response) => {
      console.log(model);
      console.log(response);
      handleValidationFailures(response.responseJSON['errors']);
    }
  });
};

const addTripHandler = function addTripHandler(event) {
  event.preventDefault();

  const trip = new Trip(makeObject(tripFields));

  if (!trip.isValid()) {
    handleValidationFailures(trip.validationError);
    return;
  }

  tripList.add(trip);

  trip.save({}, {
    success: (model, response) => {
      reportStatus('success', 'Successfully saved book!');
      $('#add-trip').hide();

    },
    error: (model, response) => {
      tripList.remove(model)
      handleValidationFailures(response.responseJSON["errors"]);
    },
  });

};

const reportStatus = function reportStatus(status, message) {
  console.log(`Reporting ${ status } status: ${ message }`);

  // Should probably use an Underscore template here.
  const statusHTML = `<li class="${ status }">${ message }</li>`;

  $('#status-messages ul').append(statusHTML);
  $('#status-messages').show();
};


const handleValidationFailures = function handleValidationFailures(errors) {

  for (let field in errors) {
    for (let problem of errors[field]) {
      reportStatus('error', `${field}: ${problem}`);
    }
  }
};

const clearStatus = function clearStatus() {
  $('#status-messages ul').html('');
  $('#status-messages').hide();
};

$(document).ready( () => {

  $('#trips-table').hide();
  $('#add-trip').hide();

  tripDetails = _.template($('#trip-info').html());
  tripTemplate = _.template($('#trip-template').html());
  registrationTemplate = _.template($('#registration-form').html());


  $('#load').on('click', showTrips);

  tripList.on('update', render)

  tripList.fetch();

  $('#trips-table').on('click', '.trip-name', showTripDetails);

  $('#trip-details').on('click', '.sign-up', loadRegistrationForm)

  $('#trip-details').on('submit', '#res-form', addReservationHandler );

  $('#add-trip-form').on('submit', addTripHandler);

  $('#add-trip-button').on('click', loadModal);

  $('#status-messages button.clear').on('click', clearStatus);
});
