// On ready, init
$(function () {

  var HASH_PREFIX = '5354414d50442323';
  var API_URL = 'http://dev.stampd.io/api/v2.php';
  // var API_URL = 'https://stampd.io/api/v2.php';

  var $blockchain = $('[name="blockchain"]');
  var $type = $('[name="type"]');
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

    var progress_cb = function (p) {
      // TODO: progress?
      console.log((p * 100).toFixed(0) + '%');
    };

    CryptoJS.SHA256(data, progress_cb, cb);
  };

  // Retrieved hash
  // =========================================================

  var retrieved_hash = function (hash) {
    currentStamp.hash = HASH_PREFIX + hash;

    post_hash(currentStamp.hash, currentStamp.blockchain, function (res) {

      if (!res) {
        $set_form.removeClass('is-disabled');
        display_notification('There was an error during your stamping, please try again', 'error');
        return;
      }

      if (res.code && res.code === 106) {
        $set_form.removeClass('is-disabled');
        display_notification('You have run out stamps, please visit stampd.io to get more', 'error');
        return;
      }

      if (res.code && res.code === 202) {
        $set_form.removeClass('is-disabled');
        display_notification('This hash has already been stampd via our service', 'error');
        return;
      }

      currentStamp.txid = res.txid;

      // TODO: notify stamp success

    });
  };

  // Load settings
  // =========================================================

  // blockchain option
  $blockchain.change(function () {
    // chrome.storage.sync.set({
    //   blockchain: $blockchain.val(),
    // }, function () {
    //   // ..
    // });
  });

  // type option
  $type.change(function () {
    // chrome.storage.sync.set({
    //   type: $type.val(),
    // }, function () {
    //   // ..
    // });
  });

  // retrieve saved options
  // chrome.storage.sync.get({
  //   client_id: null,
  //   secret_key: null,
  //   blockchain: null,
  //   type: null,
  // }, function (items) {
  //
  //   if (items.blockchain) {
  //     $blockchain.val(items.blockchain);
  //   }
  //
  //   if (items.type) {
  //     $type.val(items.type);
  //   }
  //
  //   if (items.client_id && items.secret_key) {
  //     var $client_id = $('[name="client_id"]');
  //     $client_id.val(items.client_id);
  //     var $secret_key = $('[name="secret_key"]');
  //     $secret_key.val(items.secret_key);
  //
  //     $tabs.first().click();
  //   } else {
  //     $('[data-tab-btn="settings"]').click();
  //   }
  // });

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

      // chrome.storage.sync.set({
      //   client_id: client_id,
      //   secret_key: secret_key,
      // }, function () {
      //   display_notification('Credentials saved', 'success');
      //
      //   $tabs.first().click();
      // });
    });

  });

  // Stamp
  // =========================================================

  $stamp_form.submit(function (e) {
    e.preventDefault();

    currentStamp = {};

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
      var type = $type.val();

      currentStamp.blockchain = blockchain;

      // chrome.tabs.getSelected(null, function (tab) {
      //
      //   // if (tab.incognito) {
      //   //   $stamp_form.removeClass('is-disabled');
      //   //   display_notification('This extension will not function properly in incognito', 'error');
      //   //   return;
      //   // }
      //
      //   currentStamp.tab_url = tab.url;
      // });

      if (type === 'page_content') {
        // // DOM content
        // retrieveActiveTabDom(function (dom) {
        //
        //   if (!dom) {
        //     $stamp_form.removeClass('is-disabled');
        //     display_notification('Could not retrieve the content of the active tab', 'error');
        //     return;
        //   }
        //
        //   // // screenshot
        //   // chrome.tabs.captureVisibleTab(null, {}, function (image) {
        //   //   currentStamp.img = image;
        //   // });
        //
        //   currentStamp.data = dom;
        //   currentStamp.type = 'dom';
        //   calc_hash(dom, retrieved_hash);
        //
        // });
      } else {
        // // screenshot
        // chrome.tabs.captureVisibleTab(null, {}, function (image) {
        //
        //   currentStamp.data = image;
        //   currentStamp.img = image;
        //   currentStamp.type = 'img';
        //   calc_hash(image, retrieved_hash);
        //
        // });
      }

      $set_form.removeClass('is-disabled');
    });

  });


});
