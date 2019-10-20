import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as WPAPI from 'wpapi';
import * as moment from 'moment';
import * as toastr from 'toastr';
import * as _ from 'lodash';
import { config } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
declare var $: any;
declare var Bloodhound: any;
@Component({
  selector: 'app-publicity',
  templateUrl: './publicity.component.html',
  styleUrls: ['./publicity.component.css']
})
export class PublicityComponent implements OnInit, AfterViewInit {
  public WPEndpoint: any;
  public position: string = '';
  public schemes: Array<any> = [];
  constructor(
    private Http: HttpClient,
    private authService: AuthService
  ) {
    this.WPEndpoint = new WPAPI({
      endpoint: config.apiEndpoint,
    });
    let currentUser = this.authService.getCurrentUser();
    this.WPEndpoint.setHeaders({ Authorization: `Bearer ${currentUser.token}` });
    let top = [
      { size: '1120x210', label: '1120 x 210' }
    ];
    let sidebar = [
      { size: '354x330', label: '354 x 330' },
      { size: '354x570', label: '354 x 570 (Large)' }
    ];
    this.schemes = [
      {
        position: 'position-1',
        name: 'HOME Top (position-1)',
        sizes: _.clone(top)
      },
      {
        position: 'position-2',
        name: 'HOME Side Right (position-2)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-3',
        name: 'HOME CV Top (position-3)',
        sizes: _.clone(top)
      },
      {
        position: 'position-4',
        name: 'HOME CV Side Right (position-4)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-5',
        name: 'HOME Offer Top (position-5)',
        sizes: _.clone(top)
      },
      {
        position: 'position-6',
        name: 'HOME Offer Side Right (position-6)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-7',
        name: 'Detail Offer (position-7)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-8',
        name: 'Detail CV (position-8)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-9',
        name: 'Inscription Particular (position-9)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-10',
        name: 'Inscription Professional (position-10)',
        sizes: _.clone(sidebar)
      },
      {
        position: 'position-11',
        name: 'Search Side Right (position-11)',
        sizes: _.clone(sidebar)
      },
    ]
  }

  ngOnInit() {
    this.loadCalendar();
  }

  ngAfterViewInit() {

  }

  loadCalendar(): void {
    const self = this;
    var CalendarApp = function () {
      this.$body = $("body");
      this.$calendar = $('#calendar');
      this.$event = ('#external-events div.ex-event');
      this.$categoryForm = $('#add-new-event form');
      this.$extEvents = $('#calendar-events');
      this.$modal = $('#new-event-modal');
      this.$eventModal = $('#event-modal');
      this.$saveCategoryBtn = $('.save-category');
      this.$calendarObj = null;
    };

    // handler for clicking on an empty calendar field
    CalendarApp.prototype.onSelect = function (start, end, allDay) {
      var $this = this;
      $this.$modal.modal();
      //// fill in the values
      this.$modal.find('#new-event-start').val($.fullCalendar.formatDate(start, "YYYY-MM-DD HH:mm:ss"));
      this.$modal.find('#new-event-end').val($.fullCalendar.formatDate(end, "YYYY-MM-DD HH:mm:ss"));

      $this.$calendarObj.fullCalendar('unselect');
    }

    // Update event
    CalendarApp.prototype.updateEvent = function (calEvent, revertFunc) {

      // Réfuser l'accès au commercial de modifier cette option
      if (!self.authService.notUserAccess("editor")) return;
      if (!self.authService.notUserAccess("contributor")) return;

      // The same can be done for eventDrop and eventResize
      var $this = this;
      $this.$eventModal.modal();
      // fill in the values
      $this.$eventModal.find('#event-title').val(calEvent.title);
      $this.$eventModal.find('#event-start').val($.fullCalendar.formatDate(calEvent.start, "YYYY-MM-DD HH:mm:ss"));
      $this.$eventModal.find('#event-end').val(calEvent.end ? $.fullCalendar.formatDate(calEvent.end, "YYYY-MM-DD HH:mm:ss") : '');
      if (calEvent.className.length) $this.$eventModal.find('input[name="category"][value="' + calEvent.className + '"]').prop("checked", true);
      else $this.$eventModal.find('#event-color :first-child').prop("selected", true);

      // set the handler to delete the event
      $this.$eventModal.find('#deleteEventButton').unbind('click').click(function () {
        let adsId: number = parseInt(calEvent.id);
        $.ajax({
          url: `${config.itApi}/ads/${adsId}`,
          type: "DELETE",
          dataType: 'json',
          beforeSend: function (xhr) {
            let currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.token) {
              xhr.setRequestHeader("Authorization",
                `Bearer ${currentUser.token}`);
            }
          },
          success: function (response) {
            // Remove Event
            $this.$calendarObj.fullCalendar('removeEvents', function (ev) {
              return (ev._id == calEvent._id);
            });

            toastr.success('event successfully deleted');
            $this.$eventModal.modal('hide');
          }
        });
      });

      // set the handler to update the event
      $this.$eventModal.find('form').unbind('submit').on('submit', function () {
        if ($('#eventForm').valid()) {
          var event: any = {};
          calEvent.title = event.title = $(this).find("#event-title").val();
          calEvent.start = event.start = $(this).find("#event-start").val();
          if ($(this).find("#event-end").val()) calEvent.end = event.end = $(this).find("#event-end").val();

          calEvent.className = [$(this).find('input[name="category"]:checked').val()];
          calEvent.allDay = event.allDay = true;
          // execute the query to update the event in the database
          event.className = calEvent.className[0];
          event.img_size = calEvent.img_size;
          event.position = calEvent.position;
          event.paid = calEvent.paid;
          let adsId: number = parseInt(calEvent.id);
          $.ajax({
            url: `${config.itApi}/ads/${adsId}`,
            type: "POST",
            dataType: 'json',
            data: {
              ads: JSON.stringify(event)
            },
            beforeSend: function (xhr) {
              let currentUser = JSON.parse(localStorage.getItem('currentUser'));
              if (currentUser && currentUser.token) {
                xhr.setRequestHeader("Authorization",
                  `Bearer ${currentUser.token}`);
              }
            },
            success: function (response) {
              // update event
              $this.$calendarObj.fullCalendar('updateEvent', calEvent);
              toastr.success('event successfully updated');

              $this.$eventModal.modal('hide');
            }
          });

        } else {
          toastr.error('Formulaire invalide');
        }
      });
    }

    // Called when a valid jQuery UI draggable has been dropped onto the calendar.
    CalendarApp.prototype.onDrop = function (eventObj, date) {
      var $this = this;
      // retrieve the dropped element's stored Event Object
      var originalEventObject = eventObj.data('eventObject');
      // we need to copy it, so that multiple events don't have a reference to the same object
      var copiedEventObject = $.extend({}, originalEventObject);
      //var $categoryClass = eventObj.attr('data-class');
      // assign it the date that was reported
      copiedEventObject.start = $.fullCalendar.formatDate(date, "YYYY-MM-DD HH:mm:ss");
      // execute the query to save the event in the database and get its id
      // For example

      /*$.post(APP.ASSETS_PATH+'demo/server/add-event.php', {event: copiedEventObject}).then(function(id){
          copiedEventObject.id = id;
          $this.$calendarObj.fullCalendar('renderEvent', copiedEventObject, true); // stick? = true
      }).fail(function(){
        alert('error');
      });*/

      // Create event
      copiedEventObject.id = Math.random();;
      $this.$calendarObj.fullCalendar('renderEvent', copiedEventObject, true); // stick? = true

      toastr.success('event successfully created');

      // is the "remove after drop" checkbox checked?
      if ($('#drop-remove').is(':checked')) {
        // if so, remove the element from the "Draggable Events" list
        eventObj.remove();
      }

      console.info('Drop event ...');
    };

    // initialize the external events
    CalendarApp.prototype.enableDrag = function () {
      $(this.$event).each(function () {
        // store data so the calendar knows to render an event upon drop
        $(this).data('eventObject', {
          title: $.trim($(this).text()), // use the element's text as the event title
          stick: true, // maintain when user navigates (see docs on the renderEvent method)
          className: $(this).attr('data-class')
        });

        // make the event draggable using jQuery UI
        $(this).draggable({
          zIndex: 999,
          revert: true,      // will cause the event to go back to its
          revertDuration: 0  //  original position after the drag
        });
      });
    };

    /* Initializing */
    CalendarApp.prototype.init = function () {
      console.info('Init Ads Calendar ...');
      this.enableDrag();
      var $this = this;
      $this.$calendarObj = $this.$calendar.fullCalendar({
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay,listWeek'
        },
        events: function (start, end, timezone, callback) {
          $.ajax({
            url: `${config.itApi}/ads`,
            type: 'GET',
            dataType: 'json',
            data: {
              // our hypothetical feed requires UNIX timestamps
              start: start.unix(),
              end: end.unix()
            },
            beforeSend: function (xhr) {
              let currentUser = JSON.parse(localStorage.getItem('currentUser'));
              if (currentUser && currentUser.token) {
                xhr.setRequestHeader("Authorization", `Bearer ${currentUser.token}`);
              }
            },
            success: function (response) {
              var events = [];
              _.map(response, (ads) => {
                events.push({
                  id: parseInt(ads.id_ads),
                  title: ads.title,
                  start: ads.start,
                  end: ads.end,
                  className: ads.classname,
                  id_attachment: parseInt(ads.id_attachment),
                  id_user: parseInt(ads.id_user),
                  position: ads.position,
                  paid: 1,
                  bill: ads.bill,
                  img_size: ads.img_size,
                });
              });

              callback(events);
            }
          });
        },
        editable: true,
        droppable: true, // this allows things to be dropped onto the calendar
        navLinks: true, // can click day/week names to navigate views
        eventLimit: true, // allow "more" link when too many events
        selectable: true,
        drop: function (date) { $this.onDrop($(this), date); },
        select: function (start, end, allDay) { $this.onSelect(start, end, allDay); },
        eventClick: function (calEvent, jsEvent, view) { $this.updateEvent(calEvent); },
        // The same can be done for these events
        eventResize: function (event, delta, revertFunc) { $this.updateEvent(event, revertFunc); },
        eventDrop: function (event, delta, revertFunc) { $this.updateEvent(event, revertFunc); },
        viewRender: function (view, element) { $this.viewDisplay(view, element); },
        eventRender: function (event, element, view) {
          event.allDay = event.allDay == true ? true : false;
        },
      });
    };

    CalendarApp.prototype.viewDisplay = function (view, element) {
      console.log(element);
    };


    // initializing CalendarApp

    $.CalendarApp = new CalendarApp;
    $.CalendarApp.init();

    // initialize datetimepicker
    $('.datepicker').datetimepicker({
      format: 'yyyy-mm-dd hh:ii:ss',
      pickerPosition: "top-left",
      useCurrent: false
    });

    // Validate Forms
    $('#newEventForm').validate({
      errorClass: "help-block",
      rules: {
        title: { required: true },
        start: { required: true },
      },
      highlight: function (e) { $(e).closest(".form-group").addClass("has-error") },
      unhighlight: function (e) { $(e).closest(".form-group").removeClass("has-error") },
    });

    $('#eventForm').validate({
      errorClass: "help-block",
      rules: {
        title: { required: true },
        start: { required: true },
      },
      highlight: function (e) { $(e).closest(".form-group").addClass("has-error") },
      unhighlight: function (e) { $(e).closest(".form-group").removeClass("has-error") },
    });


    // Handler to add new event
    var companyId: any = 0;
    $('#newEventForm').submit((event) => {
      event.preventDefault();

      // Réfuser l'accès au commercial de modifier cette option
      if (!self.authService.notUserAccess("editor")) return;
      if (!self.authService.notUserAccess("contributor")) return;

      if ($(event.currentTarget).valid()) {
        var fileElement: any = document.querySelector('#new-event-file');
        var fileUpload = fileElement.files[0];
        this.WPEndpoint.media()
          // Specify a path to the file you want to upload, or a Buffer
          .file(fileUpload)
          .create({
            title: $('#new-event-title').val(),
            alt_text: $('#new-event-title').val(),
            caption: '',
            description: ''
          })
          .then((response) => {
            // Your media is now uploaded: let's associate it with a post
            var newImageId = response.id;
            var CalendarApp = $.CalendarApp;
            var newAds = {
              id: Math.random(),
              title: $('#new-event-title').val(),
              start: CalendarApp.$modal.find('#new-event-start').val(),
              end: CalendarApp.$modal.find('#new-event-end').val(),
              allDay: true,
              className: CalendarApp.$modal.find('input[name="category"]:checked').val(),
              id_attachment: newImageId,
              id_user: companyId,
              position: CalendarApp.$modal.find('#new-event-position').val(),
              paid: 1,
              bill: CalendarApp.$modal.find('#new-event-bill').val(),
              img_size: CalendarApp.$modal.find('#new-event-image_size').val(),
            };

            // execute the query to save the event in the database and get its id
            let formData = new FormData();
            formData.append('ads', JSON.stringify(newAds));

            this.Http.post(`${config.itApi}/ads`, formData)
              .subscribe(response => {
                // Create Event
                CalendarApp.$calendarObj.fullCalendar('renderEvent', newAds, true); // stick? = true

                toastr.success('event successfully created');
                CalendarApp.$modal.modal('hide');
              })
          })

          .then(function (response) {
            console.log('Media ID #' + response.id);
            console.log('is now associated with Post ID #' + response.post);
          });
      }

    });

    // Trouver un entreprise
    var Company = new Bloodhound({
      datumTokenizer: function (datum) {
        return Bloodhound.tokenizers.whitespace((datum as any).value);
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: config.itApi + '/get-company/%QUERY',
        prepare: function (query, settings) {
          settings.url = settings.url.replace('%QUERY', query);
          return settings;
        },
        filter: function (data) {
          return _.map(data, (item) => {
            return {
              value: (item as any).author.ID,
              label: (item as any).title
            };
          });
        }
      }
    });
    // Initialize the Bloodhound suggestion engine
    Company.initialize();
    // Initier l'element DOM
    var inputCompanyTypeahead = $('#new-event-company');
    inputCompanyTypeahead.on('typeahead:selected', function (evt, item) {
      companyId = parseInt(item.value);
    });

    inputCompanyTypeahead.typeahead(null, {
      hint: false,
      highlight: true,
      minLength: 5,
      displayKey: 'label',
      source: Company.ttAdapter()
    } as any);
  }

}
