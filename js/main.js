'use strict';

// Johnny-Five uses stdin, which causes Electron to crash
// this reroutes stdin, so it can be used
const Readable = require('stream').Readable;
const util = require('util');
util.inherits(MyStream, Readable);
function MyStream(opt) {
  Readable.call(this, opt);
}
MyStream.prototype._read = function() {};
// hook in our stream
process.__defineGetter__("stdin", function() {
  if (process.__stdin) return process.__stdin;
  process.__stdin = new MyStream();
  return process.__stdin;
});

//open links externally by default
const shell = require('electron').shell;
$(document).on('click', 'a[href^="http"]', function(event) {
		event.preventDefault();
		shell.openExternal(this.href);
});

const debugMode = true;
const log = require('electron-log');
log.catchErrors();
const { dialog } = require('electron').remote;
const configuration = require('./js/configuration');
const j5 = require('johnny-five');
const client = require('./js/client');
const utils = require('./js/utils');
const i18n = new(require('./i18n/i18n'));

const board = new j5.Board({
	port: configuration.readSettings('usbPort'),
	timeout: 600,
	repl: false // does not work with browser console
});
let connected = false;
let sensorThreshold = configuration.readSettings('sensorThreshold');
let led1, led2, led3, sensor1, sensor2, sensor3, piezo;

board.on('ready', () => {
	connected = true;
	$('#tag-board-status').removeClass('is-danger');
	$('#tag-board-status').addClass('is-success');
	$('#tag-board-status').text(i18n.__('tag-connected'));

	// ==== hardware init
	sensor1 = new j5.Sensor({ pin: configuration.readSettings('sensorPin1'), freq: 1, threshold: 5 });
	sensor2 = new j5.Sensor({ pin: configuration.readSettings('sensorPin2'), freq: 1, threshold: 5 });
	sensor3 = new j5.Sensor({ pin: configuration.readSettings('sensorPin3'), freq: 1, threshold: 5 });
	led1 = new j5.Led(configuration.readSettings('ledPin1'));
	led2 = new j5.Led(configuration.readSettings('ledPin2'));
	led3 = new j5.Led(configuration.readSettings('ledPin3'));
	piezo = new j5.Piezo(configuration.readSettings('piezoPin'));

	// ==== emit events to client
	sensor1.on('change', () => {
		let ok = sensor1.scaleTo(0, 100) <= sensorThreshold;
		if (ok) {
			client.sensorRead1();
			flashLed(led1);
		}
	});
	sensor2.on('change', () => {
		let ok = sensor2.scaleTo(0, 100) <= sensorThreshold;
		if (ok) {
			client.sensorRead2();
			flashLed(led2);
		}
	});
	sensor3.on('change', () => {
		let ok = sensor3.scaleTo(0, 100) <= sensorThreshold;
		if (ok) {
			client.sensorRead3();
			flashLed(led3);
		}
	});

	playConnect();
});

// TODO does not work
board.on("exit", () => {
	connected = false;
	$('#tag-board-status').removeClass('is-success');
	$('#tag-board-status').addClass('is-danger');
	$('#tag-board-status').text(i18n.__('tag-disconnected'));

	led1.stop().off();
	led2.stop().off();
	led3.stop().off();
	piezo.noTone();
});

// ==========================================================================
// ==== listen to interface events and propagate to client

// tabs
$('.tabs a').on('click', (e) => {
	let $this = $(e.currentTarget);
	$('.tabs li').removeClass('is-active');
	$this.closest('li').addClass('is-active');
	let tab = $this.closest('li').data('tab');
	$('div[data-tab]').hide();
	$('div[data-tab=' + tab + ']').show();

	$('#button-manches-save').attr('disabled', true);
});

document.onkeydown = (e) => {
	if (!debugMode) {
		return;
	}
	client.keydown(e.keyCode);
};

$('#js-load-track').on('click', (e) => {
	client.loadTrack();
});

$('#js-track-save-manual').on('click', (e) => {
	if (dialog.showMessageBox({ type: 'warning', message: i18n.__('dialog-save-track'), buttons: ['Ok', 'Cancel']}) == 0) {
		$('#js-track-length-manual').removeClass('is-danger');
		$('#js-track-order-manual').removeClass('is-danger');
		if (!$('#js-track-length-manual').val()) {
			$('#js-track-length-manual').addClass('is-danger');
			return;
		}
		if (!$('#js-track-order-manual').val()) {
			$('#js-track-order-manual').addClass('is-danger');
			return;
		}
		let length = parseFloat($('#js-track-length-manual').val().replace(',', '.'));
		let order = _.map($('#js-track-order-manual').val().split('-'), (i) => { return parseInt(i); });
		client.setTrackManual(length, order);
	}
});

$('#js-load-tournament').on('click', (e) => {
	client.loadTournament();
});

$('#button-reset').on('click', (e) => {
	if (dialog.showMessageBox({ type: 'warning', message: i18n.__('dialog-new-race'), buttons: ['Ok', 'Cancel']}) == 0) {
		client.reset();
	}
});

$('#button-start').on('click', (e) => {
	if (!connected && !debugMode) {
		dialog.showMessageBox({ type: 'error', title: 'Error', message: i18n.__('dialog-disconnected')});
		return;
	}
	if (configuration.readSettings('track') == null) {
		dialog.showMessageBox({ type: 'error', title: 'Error', message: i18n.__('dialog-track-not-loaded')});
		return;
	}

	if (debugMode) {
		// debug mode
		client.startRound();
	}
	else {
		// production mode
		if (configuration.readSettings('tournament') && configuration.loadRound()) {
			// TODO MODAL SPAREGGIO
			
			if (dialog.showMessageBox({ type: 'warning', message: "Play this round again? The current data will be lost.", buttons: ['Ok', 'Cancel']}) == 1) {
				return;
			}
		}
		playStart();
	}
});

$('#button-prev').on('click', (e) => {
	client.prevRound();
});

$('#button-next').on('click', (e) => {
	client.nextRound();
});

$('#button-toggle-free-round').on('click', (e) => {
	client.toggleFreeRound();
});

$('#button-xls').on('click', (e) => {
	client.saveXls();
	$('#button-xls').attr('disabled', true);
});

$('#button-save-settings').on('click', (e) => {
	configuration.saveSettings('timeThreshold', parseFloat($('#js-settings-time-threshold').val().replace(',', '.')));
	configuration.saveSettings('speedThreshold', parseFloat($('#js-settings-speed-threshold').val().replace(',', '.')));
	configuration.saveSettings('startDelay', parseFloat($('#js-settings-start-delay').val().replace(',', '.')));
	client.showThresholds();
	e.preventDefault();
});

$('#button-save-config').on('click', (e) => {
	configuration.saveSettings('sensorPin1', $('#js-config-sensor-pin-1').val());
	configuration.saveSettings('sensorPin2', $('#js-config-sensor-pin-2').val());
	configuration.saveSettings('sensorPin3', $('#js-config-sensor-pin-3').val());
	configuration.saveSettings('ledPin1', parseInt($('#js-config-led-pin-1').val()));
	configuration.saveSettings('ledPin2', parseInt($('#js-config-led-pin-2').val()));
	configuration.saveSettings('ledPin3', parseInt($('#js-config-led-pin-3').val()));
	configuration.saveSettings('piezoPin', parseInt($('#js-config-piezo-pin').val()));
	configuration.saveSettings('sensorThreshold', parseInt($('#js-config-sensor-threshold').val()));
	configuration.saveSettings('title', $('#js-config-title').val());
	configuration.saveSettings('usbPort', $('#js-config-usb-port').val());
	dialog.showMessageBox({ type: 'warning', message: i18n.__('dialog-restart') });
	e.preventDefault();
});

$(document).on('keyup', '.js-time-form', (e) => {
	$('#button-manches-save').removeAttr('disabled');
});

$('#button-manches-cancel').on('click', (e) => {
	client.showMancheList();
	$('#button-manches-save').attr('disabled', true);
});

$('#button-manches-save').on('click', (e) => {
	let $this = $(e.currentTarget);
	if ($this.attr('disabled')) return;
	client.overrideTimes();
	$('#button-manches-save').attr('disabled', true);
});

$('.js-race-mode').on('click', (e) => {
	let $this = $(e.currentTarget);
	if ($this.attr('disabled')) return;
	$('.js-race-mode').removeClass('is-primary');
	$this.addClass('is-primary');
	var mode = $this.data('race-mode');
	configuration.saveSettings('raceMode', mode);
	switch(mode) {
		case 0:
			$('#js-race-mode-description').text(i18n.__('button-race-mode-time-attack-description'));
			break;
		case 1:
			$('#js-race-mode-description').text(i18n.__('button-race-mode-final-description'));
			break;
		case 2:
			$('#js-race-mode-description').text(i18n.__('button-race-mode-endurance-description'));
			break;
	}
});

$('.js-invalidate').on('click', (e) => {
	let $this = $(e.currentTarget);
	if ($this.attr('disabled')) return;
	if (dialog.showMessageBox({ type: 'warning', message: i18n.__('dialog-disqualify'), buttons: ['Ok', 'Cancel']}) == 0) {
		client.disqualify(null, null, parseInt($this.data('lane')));
	}
});

// ==========================================================================
// ==== send commands to hardware

const flashLed = (led) => {
	led.on();
	utils.delay(() => { led.off(); }, 1000);
};

const playStart = () => {
	$('#button-start').text(i18n.__('button-start-ready'));
	utils
	.delay(() => { led1.on(); led2.on(); led3.on(); piezo.tone(3900, 1000); }, 200)
	.delay(() => { led1.off(); led2.off(); led3.off(); piezo.noTone(); }, 1000)
	.delay(() => { led1.on(); }, 1000)
	.delay(() => { led2.on(); }, 1000)
	.delay(() => { led3.on(); }, 1000)
	.delay(() => { led1.off(); led2.off(); led3.off(); piezo.tone(3900, 1000); }, 1000)
	.delay(() => { piezo.noTone(); client.startRound(); }, 1000);
};

const playConnect = () => {
	utils
	.delay(() => { led1.blink(125); led2.blink(125); led3.blink(125); }, 125)
	.delay(() => { led1.stop().off(); led2.stop().off(); led3.stop().off(); }, 2000);
};

// ==========================================================================
// ==== init client

client.init();