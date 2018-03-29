const settings = require('electron-settings');
const fs = require('fs');
const {dialog} = require('electron').remote;
const SHA256 = require("crypto-js/sha256");

// On ready, init
$(function () {

  var HASH_PREFIX = '';
  // var API_URL = 'http://dev.stampd.io/api/v2.php';
  var API_URL = 'https://stampd.io/api/v2.php';

  var $blockchain = $('[name="blockchain"]');
  var $client_id = $('[name="client_id"]');
  var $secret_key = $('[name="secret_key"]');

  var $stamp_form = $(".js-form-stamp");
  var $set_form = $(".js-form-credentials");

  var $tabs = $('[data-tab-btn]');
  var $tabContents = $('[data-tab-content]');

  var currentStamp = {};

  // Tabs
  // =========================================================

  $tabs.click(function (e) {
    e.preventDefault();

    var $el = $(this);

    if ($el.hasClass('is-active')) {
      return;
    }

    $tabs.removeClass('is-active');
    $tabContents.removeClass('is-active');

    $el.addClass('is-active');
    $('[data-tab-content="' + $el.attr('data-tab-btn') + '"]').addClass('is-active');

  });

  // Show notification
  // =========================================================

  var display_notification = function (text, type) {
    if (typeof type === 'undefined') {
      type = 'default';
    }

    var $notif = $('.js-notification');
    var $notif_cont = $('.js-notification__content');

    $notif.attr('data-notification-type', type);

    $notif_cont.html(text);
    $notif.slideUp(0).clearQueue().slideDown(function () {
      window.setTimeout(function () {
        $notif.fadeOut();
      }, 4000);
    });
  };

  // Sign in
  // =========================================================

  var sign_in = function (client_id, secret_key, cb) {

    $.get(API_URL, {
      requestedURL: "init",
      client_id: client_id,
      secret_key: secret_key,
    }, function (res) {
      var res_json = JSON.parse(res);
      cb(res_json.code ? res_json.code : false);
    }).fail(function (res) {
      cb(false);
    });
  };

  // Post hash
  // =========================================================

  var post_hash = function (hash, blockchain, cb) {

    $.post(API_URL, {
      requestedURL: "hash",
      hash: hash,
      blockchain: blockchain,
      meta_category: 'Desktop App',
      // meta_filename
      // meta_category
      // meta_notes
      // meta_emails
    }, function (res) {
      var res_json = JSON.parse(res);
      cb(res_json ? res_json : false);
    }).fail(function (res) {
      cb(false);
    });
  };

  // Calculate hash
  // =========================================================

  var calc_hash = function (data, cb) {
    cb(SHA256(data));
  };

  // Retrieved hash
  // =========================================================

  var retrieved_hash = function (hash) {

    currentStamp.hash = HASH_PREFIX + hash;

    post_hash(currentStamp.hash, currentStamp.blockchain, function (res) {

      if (!res) {
        $stamp_form.removeClass('is-disabled');
        display_notification('There was an error during your stamping, please try again', 'error');
        return;
      }

      if (res.code && res.code === 106) {
        $stamp_form.removeClass('is-disabled');
        display_notification('You have run out stamps, please visit stampd.io to get more', 'error');
        return;
      }

      if (res.code && res.code === 202) {
        $stamp_form.removeClass('is-disabled');
        display_notification('This hash has already been stampd via our service', 'error');
        return;
      }

      currentStamp.txid = res.txid;

      display_notification('Your stamping was successful, you have ' + res.stamps_remaining + ' stamps remaining', 'success');
      $stamp_form.removeClass('is-disabled');

    });
  };

  // Load settings
  // =========================================================

  // blockchain option
  $blockchain.change(function () {
    settings.set('blockchain', $blockchain.val());
  });

  // retrieve saved options
  if (settings.has('blockchain')) {
    $blockchain.val(settings.get('blockchain'));
  }

  if (settings.has('client_id') && settings.has('secret_key')) {
    var $client_id = $('[name="client_id"]');
    $client_id.val(settings.get('client_id'));
    var $secret_key = $('[name="secret_key"]');
    $secret_key.val(settings.get('secret_key'));

    $tabs.first().click();
  } else {
    $('[data-tab-btn="settings"]').click();
  }

  // Save settings
  // =========================================================

  $set_form.submit(function (e) {
    e.preventDefault();

    $set_form.addClass('is-disabled');

    var client_id = $client_id.val();
    var secret_key = $secret_key.val();

    if (!navigator.onLine) {
      $set_form.removeClass('is-disabled');
      display_notification('Your computer appears to be offline', 'error');
      return;
    }

    sign_in(client_id, secret_key, function (code) {
      $set_form.removeClass('is-disabled');

      if (!code || (code !== 200 && code !== 300)) {
        display_notification('Incorrect credentials', 'error');
        return;
      }

      settings.set('client_id', client_id);
      settings.set('secret_key', secret_key);

      display_notification('Credentials saved', 'success');

      $tabs.first().click();
    });

  });

  // Stamp
  // =========================================================

  $stamp_form.submit(function (e) {
    e.preventDefault();

    currentStamp = {};

    dialog.showOpenDialog((fileNames) => {
      if (typeof fileNames === 'undefined' || !fileNames[0]) {
        return;
      }

      fs.readFile(fileNames[0], 'utf-8', (err, data) => {
        if (err) {
          display_notification('Error while reading selected file', 'error');
          return;
        }

        $stamp_form.addClass('is-disabled');

        var client_id = $client_id.val();
        var secret_key = $secret_key.val();

        if (!navigator.onLine) {
          $stamp_form.removeClass('is-disabled');
          display_notification('Your computer appears to be offline', 'error');
          return;
        }

        sign_in(client_id, secret_key, function (code) {
          if (!code || (code !== 200 && code !== 300)) {
            $stamp_form.removeClass('is-disabled');
            display_notification('Incorrect credentials', 'error');
            return;
          }

          display_notification('Please wait and do not close this popup as your stamping is being processed', 'success');

          var blockchain = $blockchain.val();

          currentStamp.blockchain = blockchain;
          currentStamp.data = data;

          calc_hash(currentStamp.data, retrieved_hash);

        });

      });
    });

  });


});
