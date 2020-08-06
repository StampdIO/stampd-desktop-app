const settings = require('electron-settings');
const fs = require('fs');
const { dialog } = require('electron').remote;
// const SHA256 = require("crypto-js/sha256");
const hasha = require('hasha');

// On ready, init
$(function () {

    const HASH_PREFIX = '';
    // const API_URL = 'http://localhost/stampd-v3/api/v2.php';
    const API_URL = 'https://stampd.io/api/v2.php';

    const $blockchain = $('[name="blockchain"]');
    const $client_id = $('[name="client_id"]');
    const $secret_key = $('[name="secret_key"]');

    const $stamp_form = $(".js-form-stamp");
    const $set_form = $(".js-form-credentials");

    const $tabs = $('[data-tab-btn]');
    const $tabContents = $('[data-tab-content]');

    let currentStamp = {};

    // Tabs
    // =========================================================

    $tabs.click(function (e) {
        e.preventDefault();

        let $el = $(this);

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

    const display_notification = function (text, type) {
        if (typeof type === 'undefined') {
            type = 'default';
        }

        let $notif = $('.js-notification');
        let $notif_cont = $('.js-notification__content');

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

    const sign_in = function (client_id, secret_key, cb) {

        $.get(API_URL, {
            requestedURL: "init",
            client_id: client_id,
            secret_key: secret_key
        }, function (res) {
            let res_json = JSON.parse(res);
            cb(res_json.code ? res_json.code : false);
        }).fail(function (res) {
            cb(false);
        });
    };

    // Post hash
    // =========================================================

    const post_hash = function (hash, blockchain, filename, cb) {
        $.post(API_URL, {
            requestedURL: "hash",
            hash: hash,
            blockchain: blockchain,
            meta_category: 'Desktop App',
            meta_filename: filename
            // meta_notes
            // meta_emails
        }, function (res) {
            let res_json = JSON.parse(res);
            cb(res_json ? res_json : false);
        }).fail(function (res) {
            cb(false);
        });
    };

    // Calculate hash
    // =========================================================

    // const calc_hash = function (data, cb, filename) {
    //     cb(SHA256(data), filename);
    // };

    // Retrieved hash
    // =========================================================

    const retrieved_hash = function (hash, filename) {

        currentStamp.hash = HASH_PREFIX + hash;

        post_hash(currentStamp.hash, currentStamp.blockchain, filename, function (res) {

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
        let $client_id = $('[name="client_id"]');
        $client_id.val(settings.get('client_id'));
        let $secret_key = $('[name="secret_key"]');
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

        let client_id = $client_id.val();
        let secret_key = $secret_key.val();

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

    const get_filename = function (full_path) {
        return full_path.split('\\').pop().split('/').pop();
    };

    $stamp_form.submit(function (e) {
        e.preventDefault();

        currentStamp = {};

        dialog.showOpenDialog((fileNames) => {
            if (typeof fileNames === 'undefined' || !fileNames[0]) {
                return;
            }

            const fileStream = fs.createReadStream(fileNames[0], {
                encoding: 'utf-8'
            });

            $stamp_form.addClass('is-disabled');

            display_notification('Please wait, your file is being processed', 'success');

            hasha.fromStream(fileStream, { algorithm: 'sha256' }).then(data => {

                let client_id = $client_id.val();
                let secret_key = $secret_key.val();

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

                    display_notification('Your stamping is now being transmitted', 'success');

                    currentStamp.blockchain = $blockchain.val();
                    currentStamp.data = data;

                    retrieved_hash(currentStamp.data, get_filename(fileNames[0]));

                });

            }).catch(e => {
                console.error(e);
                display_notification('Error while reading selected file', 'error');
            });
        });

    });


});
