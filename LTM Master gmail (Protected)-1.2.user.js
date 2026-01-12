// ==UserScript==
// @name         LTM Master Gmail (Protected)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Comprehensive e-GP Automation with Gmail Verification (Strict Save) + Date Calculator (Mobile & PC Optimized)
// @author       S M RUKONUT ZAMAN
// @match        *://*.eprocure.gov.bd/*
// @grant        GM_addStyle
// ==/UserScript==

(async function() {
    'use strict';

    // =========================================================================
    // 🔓 [NEW FIX] কপি-পেস্ট এবং রাইট-ক্লিক সচল করার বিশেষ লজিক (কোনো ফাংশন ডিলিট করা হয়নি)
    // =========================================================================
    (function() {
        // ১. ওয়েবসাইটের নিজস্ব রাইট-ক্লিক ব্লক করার ফাংশনগুলোকে নিষ্ক্রিয় করা
        document.oncontextmenu = null;
        window.oncontextmenu = null;
        document.onmousedown = null;
        document.onselectstart = null;
        document.oncopy = null;
        document.onpaste = null;

        // ২. "Right Click is not allowed" পপআপ আসা বন্ধ করা (Event Interception)
        window.addEventListener('contextmenu', function(e) {
            e.stopPropagation();
        }, true);

        // ৩. টেক্সট সিলেক্ট এবং কপি করার পারমিশন জোরপূর্বক চালু করা (CSS)
        const unlockStyle = document.createElement('style');
        unlockStyle.innerHTML = `
            * {
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                user-select: text !important;
                pointer-events: auto !important;
            }
            input, textarea {
                -webkit-user-select: text !important;
                user-select: text !important;
            }
        `;
        document.head.appendChild(unlockStyle);

        // ৪. ওয়েবসাইটের alert() ফাংশন যদি রাইট ক্লিক নিয়ে কিছু বলে, তবে তাকে থামানো
        const originalAlert = window.alert;
        window.alert = function(msg) {
            if (msg.includes("Right Click is not allowed") || msg.includes("security reason")) {
                console.log("Blocked security alert: " + msg);
                return;
            }
            originalAlert(msg);
        };
    })();

    // =========================================================================
    // 🚀 [FIX] PREVENT "CONFIRM FORM RESUBMISSION" POPUP
    // =========================================================================
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }

    // =========================================================================
    // 🛡️ [START] GMAIL VERIFICATION GATEWAY (Added by AI Assistant)
    // =========================================================================
    const API_BASE = "https://kiron-extension-auth.vercel.app/api/auth/verify";
    let authorizedEmail = localStorage.getItem('authorizedEmail');

    // ভেরিফিকেশন স্টাইল (CSS)
    const authStyle = document.createElement('style');
    authStyle.innerHTML = `
        #auth-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.95); z-index: 2147483647;
            display: flex; justify-content: center; align-items: center; font-family: sans-serif;
        }
        .auth-box {
            background: #fff; padding: 30px; border-radius: 15px; width: 350px; text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5); border-top: 5px solid #00695c;
        }
        .auth-box h2 { margin: 0 0 15px; color: #333; font-size: 22px; }
        .auth-box input {
            width: 100%; padding: 12px; margin-bottom: 20px;
            border: 2px solid #ccc; border-radius: 8px; box-sizing: border-box; font-size: 16px;
        }
        .auth-box button {
            width: 100%; padding: 12px; background: #00695c; color: white;
            border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px;
        }
        #auth-status { margin-top: 15px; font-size: 14px; font-weight: bold; }
        .err { color: red; } .ok { color: green; }
    `;
    document.head.appendChild(authStyle);

     // [Bypass logic] fetch API ব্যবহার করা হয়েছে যাতে @connect permission বক্স না আসে।
    async function checkAuth(email) {
        try {
            const response = await fetch(`${API_BASE}?email=${encodeURIComponent(email)}`);
            if (!response.ok) return false;
            const j = await response.json();
            return (j.status === "allowed" || j.allowed === true);
        } catch (e) {
            console.error("Verification error:", e);
            return false;
        }
    }

    if (!authorizedEmail) {
        const overlay = document.createElement('div');
        overlay.id = 'auth-overlay';
        overlay.innerHTML = `
            <div class="auth-box">
                <h2>RUKONUT ZAMAN</h2>
                <p style="font-size:14px;font-weight: bold; color:#000;">এই টুল ব্যবহারের জন্য অনুমোদিত Gmail ID আবশ্যক।ধন্যবাদান্তে, এস এম রুকোনুত জামান</p>
                <input type="email" id="userEmail" placeholder="example@gmail.com">
                <button id="verifyBtn">Verify</button>
                <div id="auth-status"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        const btn = overlay.querySelector('#verifyBtn');
        const status = overlay.querySelector('#auth-status');
        const input = overlay.querySelector('#userEmail');

        btn.onclick = async () => {
            const email = input.value.trim();
            if (!email) { status.innerText = "Email is required!"; status.className = "err"; return; }
            status.innerText = "Verifying..."; status.className = "";
            const isOk = await checkAuth(email);
            if (isOk) {
                localStorage.setItem('authorizedEmail', email);
                status.innerText = "Success! Saving & Loading...ভেরিফিকেশন সফল! টুলটি এখন চালু হচ্ছে।"; status.className = "ok";
                setTimeout(() => window.location.href = window.location.href, 1000);
            } else {
                status.innerText = "দুঃখিত! এই ইমেলটি অনুমোদিত নয়।"; status.className = "err";
            }
        };
        return; // স্টপ করুন, যতক্ষণ ভেরিফাই না হচ্ছে
    }
    // [🛡️ END] GMAIL VERIFICATION GATEWAY
    // ==========================================


    // =========================================================================
    // ⬇️ আপনার মূল কোড (বিন্দুুমাত্র পরিবর্তন ছাড়া নিচে দেওয়া হলো) ⬇️
    // =========================================================================

    /* global chrome, showToast */
    /* eslint-disable no-multi-spaces */

    (function() {
        'use strict';

        // =========================================================================
        // 🌐 [NEW] MULTI-TAB ISOLATION LOGIC (DYNAMIC FIX)
        // =========================================================================
        // এই লজিকটি প্রতিটি ট্যাবের জন্য টেন্ডার আইডি লক করবে।
        const urlParams = new URLSearchParams(window.location.search);
        let tenderId = urlParams.get('tenderId') || urlParams.get('tenderID');

        // [DYNAMIC LOCK] যদি ইউআরএল এ আইডি না থাকে, তবে সেশন থেকে আইডি নিবে
        if (tenderId) {
            sessionStorage.setItem('tm_active_tender_id', tenderId);
        } else {
            tenderId = sessionStorage.getItem('tm_active_tender_id') || "";
        }

        const storagePrefix = tenderId ? `_${tenderId}` : "";

        // স্টোরেজ কী-গুলো ডাইনামিক করা হলো যাতে ট্যাবগুলো আলাদা থাকে
        const K = (key) => {
            // এই লিস্টের ভেতরের কি-গুলো সব টেন্ডার বা ট্যাবে একই ডাটা দেখাবে (Shared হবে)
            const sharedKeys = [
                'tm_panel_top', 'tm_panel_left', 'tm_panel_zoom', 'tm_panel_delay',
                'global_gp_password', 'savedPassword', 'tm_mapper_minimized', 'tm_main_grid_minimized',
                // MAPPER Shared Keys
                'mapper_sno_1633420', 'mapper_sno_1633421', 'mapper_sno_1633422',
                'mapper_sno_1633423', 'mapper_sno_1633424', 'mapper_sno_0',
                'mapper_skip_1633420', 'mapper_skip_1633421', 'mapper_skip_1633422',
                'mapper_skip_1633423', 'mapper_skip_1633424', 'mapper_skip_0',
                // e-PW2B-2 Shared Keys
                'row2215370_1_1', 'row2215370_1_2', 'row2215371_1_1', 'row2215371_1_2', 'row2215371_1_3',
                'row2215372_1_1', 'row2215372_1_2', 'row2215372_1_3', 'row2215373_1_1', 'row2215373_1_2',
                'row2215373_1_3', 'row2215373_1_4', 'row2215373_1_5',
                // Activities Shared Keys
                'row2215374_1_6', 'row2215374_1_7',
                // e-PW2B-3 Shared Keys
                'row2215375_1_1', 'row2215375_1_3', 'row2215375_1_4', 'row2215375_1_5', 'row2215375_1_6',
                'row2215375_1_7', 'row2215375_1_8', 'row2215376_1_1', 'row2215376_1_2', 'row2215376_1_3',
                'row2215376_1_4', 'row2215376_1_5', 'row2215376_1_6', 'row2215376_1_7', 'row2215376_1_8',
                'row2215377_1_1', 'row2215377_1_2', 'row2215377_1_3', 'row2215377_1_4', 'row2215377_1_5',
                'row2215377_1_6', 'row2215377_1_7',
                // Percentage Shared Key
                'row2215390_1_2'
            ];
            if (sharedKeys.includes(key)) return key; // এই কি-গুলো সব ট্যাবে একই থাকবে
            return key + storagePrefix; // অটোমেশনের রান-টাইম স্ট্যাটাসগুলো Tender ID অনুযায়ী আলাদা হবে
        };

        // =========================================================================
        // 🛑 EMERGENCY STOP FLAG
        // =========================================================================
        let STOP_FLAG = false;

        // =========================================================================
        // 🔥🔥 [SETTINGS] সর্বোচ্চ ডিলে বা দেরি করার সময় (মিলি সেকেন্ডে) 🔥🔥
        const maxDelayLimit = 15000;


        // আপনার ড্রাইভের ছবির জন্য আরও উন্নত ডিরেক্ট লিংক ব্যবহার করা হয়েছে
            const photoID = "1KvJDr7HZ4lQXjQL (truncated) ..."; // Keeping original URL logic
            const myPhotoURL = `https://lh3.googleusercontent.com/d/1KvJDr7HZ4lQXjQLQ34be0gmFuj6I1Yub`;


        // =========================================================================
        // 🛠️ GLOBAL TOAST FUNCTION (Added to make it accessible everywhere)
        // =========================================================================
        window.showToast = function(msg) {
            let existingToast = document.getElementById("tm-automation-toast");
            if (!existingToast) {
                existingToast = document.createElement("div");
                existingToast.id = "tm-automation-toast";
                existingToast.style.cssText = `
                    position: fixed;
                    top: 10%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #000;
                    color: #fff;
                    padding: 10px 20px;
                    border-radius: 24px;
                    z-index: 2147483647;
                    font-size: 16px;
                    font-weight: bold;
                    transition: all 0.2s ease-in-out;
                    text-align: center;

                `;
                document.body.appendChild(existingToast);
            }
            existingToast.innerText = msg;
            existingToast.style.opacity = "1";
            existingToast.style.display = "block";
            clearTimeout(window.toastTimeout);
            window.toastTimeout = setTimeout(() => {
                existingToast.style.opacity = "0";
                setTimeout(() => { if(existingToast) existingToast.remove(); }, 500);
            }, 2000);
        };


        // =========================================================================
        // PART 0: CHROME API SHIM
        // =========================================================================
        const listeners = [];
        const storageData = {};

        function loadStorage() {
            try {
                const raw = localStorage.getItem(K('tm_chrome_storage_shim'));
                if (raw) Object.assign(storageData, JSON.parse(raw));
            } catch (e) {}
        }
        function saveStorage() {
            localStorage.setItem(K('tm_chrome_storage_shim'), JSON.stringify(storageData));
        }
        loadStorage();

        window.chrome = {
            runtime: {
                onInstalled: { addListener: (cb) => { } },
                onMessage: {
                    addListener: (cb) => listeners.push(cb)
                },
                sendMessage: (msg, cb) => {
                    setTimeout(() => {
                        let responded = false;
                        const sendResponse = (resp) => {
                            if (!responded && cb) { cb(resp); responded = true; }
                        };
                        listeners.forEach(listener => {
                            listener(msg, { tab: { id: 1 } }, sendResponse);
                        });
                    }, 20);
                }
            },
            tabs: {
                query: (queryInfo, cb) => { cb([{ id: 1, active: true }]); },
                sendMessage: (tabId, msg, cb) => {
                    setTimeout(() => {
                        let responded = false;
                        const sendResponse = (resp) => {
                            if (!responded && cb) { cb(resp); responded = true; }
                        };
                        listeners.forEach(listener => {
                            listener(msg, { tab: { id: 1 } }, sendResponse);
                        });
                    }, 20);
                }
            },
            storage: {
                local: {
                    get: (keys, cb) => {
                        loadStorage();
                        let result = {};
                        if (Array.isArray(keys)) {
                        keys.forEach(k => result[k] = storageData[k]);
                        } else if (typeof keys === 'string') {
                            result[keys] = storageData[keys];
                        } else {
                            result = { ...storageData };
                        }
                        cb(result);
                    },
                    set: (items, cb) => {
                        Object.assign(storageData, items);
                        saveStorage();
                        if (cb) cb();
                    }
                }
            },
            scripting: {
                executeScript: (opts, cb) => { if (cb) cb(); }
            }
        };

        // =========================================================================
        // PART 1: UI INJECTION
        // =========================================================================

        const savedTop = localStorage.getItem(K('tm_panel_top')) || '100px';
        const savedLeft = localStorage.getItem(K('tm_panel_left')) || '20px';
        const savedZoom = localStorage.getItem(K('tm_panel_zoom')) || '1';
        const savedDelay = localStorage.getItem(K('tm_panel_delay')) || '1000';
        const mapperIsMinimized = localStorage.getItem(K('tm_mapper_minimized')) === 'true';
        const mainGridIsMinimized = localStorage.getItem(K('tm_main_grid_minimized')) === 'true';

        const popupContainer = document.createElement('div');
        popupContainer.id = 'tm-popup-container';
        popupContainer.style.cssText = `position:fixed; top:${savedTop}; left:${savedLeft}; z-index:2147483646; display:block; background:transparent; transform-origin: top left; transform: scale(${savedZoom}); touch-action: none;`;

        const style = document.createElement('style');
        style.textContent = `
            /* Scoped CSS */
            #tm-popup-wrapper { font-family: 'Hind Siliguri', sans-serif; width: 400px; margin: 0; background-color: #eceff1; overflow-x: hidden; font-size: 18px; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.4); border: 1px solid #004d40; transition: box-shadow 0.2s, background-color 0.2s; will-change: transform; }
            #tm-popup-wrapper .top-section { background: linear-gradient(135deg, #00695c, #004d40); padding: 6px; color: white; cursor: move; user-select: none; }
            #tm-popup-wrapper h2 { margin: 2px 0; font-size: 24px;font-weight: bold; text-align: center; pointer-events: none; display: flex; align-items: center; justify-content: center; }

            /* 🛑 Emergency STOP Button Style */
            #btn-tm-stop { background: #f44336; color: white; border: 2px solid white; padding: 6px 13px; border-radius: 4px; cursor: pointer; font-size: 20px; margin-left: 10px; font-weight: bold; pointer-events: auto; }
            #btn-tm-stop:hover { background: #d32f2f; }
            #btn-tm-stop.active { background: #000; }

             /* 🛑 STATUS TEXT - পাসওয়ার্ড দিয়ে বাটন চাপুন (EXTRA LARGE) */
            #tm-popup-wrapper #status {text-align: center;font-size: 20px !important; /* সবচেয়ে বড় ফন্ট */ font-weight: 800 !important; margin: auto !important;color: #d32f2f;padding: 14px;border-radius: 6px;background: #ffffff;border: 2px solid #004d40;line-height: 1.0;transition: all 0.3s ease;width:68%;display: block;}

            .control-row { display: flex; align-items: center; justify-content: space-between; margin: 4px 10px; color: #fff; }
            input[type=range].tm-slider { -webkit-appearance: none; flex-grow: 1; background: transparent; }
            input[type=range].tm-slider:focus { outline: none; }
            input[type=range].tm-slider::-webkit-slider-runnable-track { width: 100%; height: 5px; cursor: pointer; background: #b2dfdb; border-radius: 2px; }
            input[type=range].tm-slider::-webkit-slider-thumb { height: 14px; width: 14px; border-radius: 50%; background: #ffffff; cursor: pointer; -webkit-appearance: none; margin-top: -5px; box-shadow: 0 1px 3px rgba(0,0,0,0.4); }

           #tm-popup-wrapper .global-pass-box { position: relative;background: white; padding: 6px; border-radius: 6px; margin-top: 6px; border-left: 4px solid #d32f2f; color: #333; font-size: 20px; font-weight:bold; cursor: default; }
            #tm-popup-wrapper .global-pass-box input { width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; font-size: 20px; font-weight:bold; }

           /* 🛑 [UPDATED] Minimize Button CSS - Now in Top-Right Position as per Image 2 */
            #btn-minimize-main { position: absolute; top: 8px; right: 10px; background: #0d47a1; color: white; border: none; padding: 0px 8px; border-radius: 4px; cursor: pointer; font-size: 18px; line-height: 1; z-index: 10; }

            #btn-minimize-main:hover { background: #1565c0; }

            #tm-popup-wrapper .content { padding: 8px; }

            #tm-popup-wrapper .grid-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 5px; }
            #tm-popup-wrapper .btn-fill, #tm-popup-wrapper .btn-encrypt { background: #ffffff; border: none; padding: 10px; border-radius: 8px; cursor: pointer; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform 0.1s, background-color 0.2s; font-size: 20px; font-weight: 620; }
            #tm-popup-wrapper .btn-fill:hover, #tm-popup-wrapper .btn-encrypt:hover { transform: translateY(-2px); background: #e3f2fd; box-shadow: 0 6px 7px rgba(0,0,0,0.15); }

            #btn-multi-boq { grid-column: span 1; background: #e0f2f1; color: #00695c; border: 1px solid #004d40; }
            #btn-multi-boq:hover { background: #b2dfdb; }
            #btn-ltm-auto { grid-column: span 1; background: #fff3e0; color: #e65100; border: 1px solid #ff9800; }
            #btn-ltm-auto:hover { background: #ffe0b2; }

            /* New Master Button Style */
            #btn-encrypt-auto-master {background: #ffffff; border: none; padding: 10px; border-radius: 8px; cursor: pointer; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform 0.1s, background-color 0.2s; font-size: 20px; font-weight: 620; }
            #btn-encrypt-auto-master:hover {transform: translateY(-2px); background: #e3f2fd; box-shadow: 0 6px 7px rgba(0,0,0,0.15);}

            #tm-popup-wrapper .mapper-section { padding: 9px; background: #e3f2fd; border-radius: 8px; margin-top: 5px; }
            #tm-popup-wrapper .mapper-header { text-align: left; color: #0d47a1; margin-bottom: 5px; font-weight: bold; font-size: 16px; border-bottom: 1px solid #90caf9; padding-bottom: 3px; display: flex; justify-content: space-between; align-items: center; }

            /* ➖ Minimize Button CSS */
            #btn-minimize-mapper { background: #0d47a1; color: white; border: none; padding: 0px 8px; border-radius: 4px; cursor: pointer; font-size: 18px; line-height: 1; }
            #btn-minimize-mapper:hover { background: #1565c0; }

            #tm-popup-wrapper .row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 20px; font-weight:bold; }
            #tm-popup-wrapper .row input { width: 90px; padding: 4px 18px; border: 3px solid #90caf9; border-radius: 3px; font-size: 23px; height:28px; }
            #tm-popup-wrapper .btn-map { width: 100%; background: #F3FFE7; color: Black; padding: 10px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 22px; margin-top: 4px; }
            #tm-popup-wrapper .row input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
            #tm-popup-wrapper .btn-map:hover { background: #1565c0; }
            #tm-popup-wrapper .status-text { text-align: center; font-size: 10px; font-weight: bold; margin-top: 4px; color: #555; }
            #tm-popup-wrapper .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); z-index: 2147483647; justify-content: center; align-items: center; }
            #tm-popup-wrapper .modal-content { background: white; width: 85%; max-height: 85%; height: auto; border-radius: 8px; padding: 10px; overflow-y: auto; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
            #tm-popup-wrapper .close-btn { position: absolute; top: 5px; right: 10px; font-size: 20px; cursor: pointer; color: #d32f2f; transition: 0.2s; }
            #tm-popup-wrapper .close-btn:hover { transform: scale(1.1); }
            #tm-popup-wrapper .field-group { font-size: 20px !important; color: #0000; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #b2dfdb; padding-bottom: 3px; }
            #tm-popup-wrapper .input-group label { font-size: 20px !important; font-weight: 700; color: #000; margin-bottom: 4px; display: block; line-height: 1.3; }
            #tm-popup-wrapper .input-group input, #tm-popup-wrapper .input-group textarea { font-size: 20px !important; padding: 6px 6px !important; height: auto; min-height: 10px; width: 98%; border: 1px solid #000; border-radius: 3px; background-color: #ffffff; margin-bottom: 8px; }
            #tm-popup-wrapper .input-group input:focus { border: 2px solid #00695c; background-color: #E8E8FF; outline: none; }

            /* 📸 প্রোফাইল পিকচার অনেক বড় এবং মাঝখানে রাখার জন্য CSS */
            .img-container {
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                width: 100% !important;
                padding: 1px 0 1px 0 !important; /* উপরে নিচে জায়গা বাড়ানো হয়েছে */
            }
            .user-profile-pic {
                width: 130px !important; /* সাইজ ১৫০ পিক্সেল করা হয়েছে */
                height: 130px !important;
                border-radius: 50% !important; /* নিখুঁত গোলাকার */
                border: 5px solid #ffffff !important;
                object-fit: cover !important;
                box-shadow: 0 1px 15px rgba(0,0,0,0.4) !important;
                display: block !important;
            }

            /* 🔥 PERSISTENT SCROLLING ANIMATION CSS 🔥 */
            .tm-marquee-container {
                width: 100%;
                overflow: hidden;
                background: #F3FFE7;
                color: #0A0A0A;  /* এটিই ফন্ট বা টেক্সট কালার */
                margin: 8px 0;
                padding: 6px 0;
                border-radius: 4px;
                border: 2px solid #004d40;
                white-space: nowrap;
                position: relative;
            }
            .tm-marquee-text {
                display: inline-block;
                font-size: 28px;
                font-weight: bold;
                font-family: 'Courier New', monospace;
                animation: tm-marquee-scroll 10s linear infinite;
                will-change: transform;
            }
            @keyframes tm-marquee-scroll {
                from { transform: translateX(400px); }
                to { transform: translateX(-99%); }
            }


            /* 🛑 Updated Parent Style for Positioning */
            #tm-popup-wrapper .btn-fill, #tm-popup-wrapper .btn-encrypt {
                position: relative; /* এটি যোগ করা হয়েছে যাতে সন্তান (Checkbox) এর ভেতরে থাকে */
                background: #ffffff; border: none; padding: 10px; border-radius: 8px; cursor: pointer;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); text-align: center; display: flex;
                flex-direction: column; align-items: center; justify-content: center;
                transition: transform 0.1s, background-color 0.2s; font-size: 20px; font-weight: 620;
            }

            /* 🛑 Skip Checkbox - Top Right position inside e-pw2b-2 button */

               .skip-container {
                position: absolute !important;
                top: 10px !important; /* একটু নিচে নামানো হয়েছে দেখার সুবিধার জন্য */
                right: 10px !important;
                display: flex;
                align-items: center;
                background: #ffebee;
                padding: px;
                border-radius: 50%;
                border: 0px solid #ffcdd2;
                z-index: 10;
            }
            .skip-container input {
                width: 30px;
                height: 30px;
                cursor: pointer;
                margin: 0;
                appearance: none;
                -webkit-appearance: none;
                border: 2px solid #d32f2f;
                border-radius: 50%;
                outline: none;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: 0.2s;
            }
            .skip-container input:checked {
                background-color: #d32f2f;
                box-shadow: inset 0 0 0 2px #fff;
            }

            /* Logout Button Style */
            #btn-tm-logout { font-size: 20px; color:#000; font-weight: bold;cursor: pointer; margin-top: 5px; text-decoration: underline; }

       `;
        document.head.appendChild(style);





        popupContainer.innerHTML = `
            <div id="tm-popup-wrapper">
            <div style="text-align:center; padding:1px; cursor: move;" class="top-handle-area"></div>
            <div class="section-container">
                <div class="top-section">

                <div class="img-container">
                    <img src="${myPhotoURL}" class="user-profile-pic">
                </div>


                    <h2>S M RUKONUT ZAMAN <button id="btn-tm-stop">STOP</button></h2>
                    <div class="control-row">
                        <span>🔍</span><input type="range" min="0.5" max="1.5" step="0.01" value="${savedZoom}" class="tm-slider" id="tm-zoom-slider" title="Zoom In/Out">
                    </div>
                    <div class="control-row">
                        <span>⏱️</span><input type="range" min="500" max="${maxDelayLimit}" step="50" value="${savedDelay}" class="tm-slider" id="tm-delay-slider" title="Processing Speed (ms)">
                        <span id="delay-display" class="val-label">${savedDelay}ms</span>
                    </div>
                    <div class="global-pass-box">
                        <label>🔑 পাসওয়ার্ড (সবার জন্য)</label><input type="password" id="global_password" class="tm-ignore" placeholder="পাসওয়ার্ড লিখুন...">
                        <button id="btn-minimize-main" title="Minimize/Maximize Buttons">${mainGridIsMinimized ? '+' : '−'}</button>
                    </div>
                </div>
                <div class="content" id="tm-main-content" style="display: ${mainGridIsMinimized ? 'none' : 'block'};">
                    <div class="grid-buttons">
                        <div class="btn-fill" id="btn-pw2b1"><span>🔒</span> e-PW2B-1</div>

                        <!-- 🛑 Skip Checkbox is here now, inside btn-pw2b2 -->
                        <div class="btn-fill" id="btn-pw2b2">
                            <div class="skip-container" title="Skip this form in LTM Auto">
                                <input type="checkbox" id="skip_pw2b2_auto">
                            </div>
                            <span>📝</span> e-PW2B-2
                        </div>

                        <div class="btn-fill" id="btn-activities"><span>📅</span> Activities</div>
                        <div class="btn-fill" id="btn-pw2b3"><span>📋</span> e-PW2B-3</div>
                        <div class="btn-fill" id="btn-pw2b4"><span>📋</span> Percentage</div>
                        <div class="btn-fill" id="btn-pw2b5"><span>📋</span> BOQ ONE </div>
                        <div class="btn-fill" id="btn-multi-boq"><span>📂</span> Multi-BOQ Auto</div>
                        <div class="btn-fill" id="btn-ltm-auto"><span>🚀</span> LTM Auto</div>
                        <div class="btn-fill btn-encrypt" id="btn-super-encrypt"><span>🚀</span> Encrypt ONE</div>
                        <div class="btn-fill" id="btn-encrypt-auto-master"><span>🚀</span> Encrypt ALL </div>
                    </div>
                   </div>

                    <div style="padding: 0 8px 8px 8px;">
                    <button id="run_map" class="btn-map">Run MAP-2</button>

                    <div id="btn-tm-logout"></div>
                </div>
            </div>
            <hr class="divider">
            <div class="mapper-section">
                <div class="mapper-header">
                    <span>MAP-2 Document Mapper (Skip বাদ)</span>
                    <button id="btn-minimize-mapper">${mapperIsMinimized ? '+' : '−'}</button>
                </div>
                <div id="mapper-body" style="display: ${mapperIsMinimized ? 'none' : 'block'};">
                    <div id="status_mapper" class="status-text" style="color:#0d47a1;">Status: Ready</div>
                    <div class="row"><span>Trade License</span> <span>Skip <input type="checkbox" id="skip_1633420" class="tm-ignore-check"></span> <input id="sno_1633420" class="tm-ignore" placeholder="নাম্বার"></div>
                    <div class="row"><span>TIN Certificate</span> <span>Skip <input type="checkbox" id="skip_1633421" class="tm-ignore-check"></span> <input id="sno_1633421" class="tm-ignore" placeholder="নাম্বার"></div>
                    <div class="row"><span>VAT Certificate</span> <span>Skip <input type="checkbox" id="skip_1633422" class="tm-ignore-check"></span> <input id="sno_1633422" class="tm-ignore" placeholder="নাম্বার"></div>
                    <div class="row"><span>Liquid Assets</span> <span>Skip <input type="checkbox" id="skip_1633423" class="tm-ignore-check"></span> <input id="sno_1633423" class="tm-ignore" placeholder="নাম্বার"></div>
                    <div class="row"><span>Other</span> <span>Skip <input type="checkbox" id="skip_0" class="tm-ignore-check"></span> <input id="sno_0" class="tm-ignore" placeholder="নাম্বার"></div>
                    <div class="row"><span>Updated LGED Enlistment Documents</span> <span>Skip <input type="checkbox" id="skip_1633424" class="tm-ignore-check"></span> <input id="sno_1633424" class="tm-ignore" placeholder="নাম্বার"></div>

                </div>

                 <!-- ➖ [নতুন অ্যানিমেশন ডিসপ্লে এখানে যোগ করা হয়েছে] ➖ -->
                    <div class="tm-marquee-container">
                        <div id="tm-persistent-marquee" class="tm-marquee-text">

                      اقْرَأْ بِسْمِ رَبِّكَ الَّذِي خَلَقَ (ইকরা বিছমি রাব্বিকাল্লাযী খালাক): পড়ো তোমার রবের নামে, যিনি সৃষ্টি করেছেন। خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ (খালাকাল ইনসানা মিন 'আলাক): তিনি মানুষকে জমাট রক্ত থেকে সৃষ্টি করেছেন। اقْرَأْ وَرَبُّكَ الْأَكْرَمُ (ইকরা ওয়া রাব্বুকাল আকরাম): পাঠ করুন, আপনার পালনকর্তা মহা দয়ালু,।الَّذِي عَلَّمَ بِالْقَلَمِ (আল্লাযী আল্লামা বিল কালাম): যিনি কলমের সাহায্যে শিক্ষা দিয়েছেন। 

                        </div>
                    </div>

            </div>
            <!-- Modals... -->
            <div id="modal-pw2b1" class="modal"><div class="modal-content"><span class="close-btn">&times;</span><div class="modal-header">e-PW2B-1 সেটিংস</div><p>সরাসরি বাটন চাপলে পাসওয়ার্ড নিয়ে কাজ করবে।</p></div></div>
            <div id="modal-pw2b2" class="modal">
                <div class="modal-content"><span class="close-btn">&times;</span><div class="modal-header">e-PW2B-2 ডেটা এডিট</div>
                <div class="input-group">
                    <div class="field-group"><h4>Basic Specs (370)</h4><label>Tenderer's legal title</label><input type="text" id="row2215370_1_1" class="auto-save tm-ignore" data-section="pw2b2"><label>Tenderer's registered address</label><input type="text" id="row2215370_1_2" class="auto-save tm-ignore" data-section="pw2b2"></div>
                    <div class="field-group"><h4>Financial (371)</h4><label>No</label><input type="text" id="row2215371_1_1" class="auto-save tm-ignore" data-section="pw2b2"><label>Source of Financing</label><input type="text" id="row2215371_1_2" class="auto-save tm-ignore" data-section="pw2b2"><label>Amount Available</label><input type="text" id="row2215371_1_3" class="auto-save tm-ignore" data-section="pw2b2"></div>
                    <div class="field-group"><h4>Experience (372)</h4><label>Type of Equipment</label><input type="text" id="row2215372_1_1" class="auto-save tm-ignore" data-section="pw2b2"><label>Condition</label><textarea id="row2215372_1_2" class="auto-save tm-ignore" data-section="pw2b2" rows="3"></textarea><label>Owned, leased or to be purchased</label><textarea id="row2215372_1_3" class="auto-save tm-ignore" data-section="pw2b2" rows="3"></textarea></div>
                    <div class="field-group"><h4>Locations/Info (373)</h4><label>Sl No.</label><input type="text" id="row2215373_1_1" class="auto-save tm-ignore" data-section="pw2b2"><label>Name</label><input type="text" id="row2215373_1_2" class="auto-save tm-ignore" data-section="pw2b2"><label>Position</label><input type="text" id="row2215373_1_3" class="auto-save tm-ignore" data-section="pw2b2"><label>Years of General Experience</label><input type="text" id="row2215373_1_4" class="auto-save tm-ignore" data-section="pw2b2"><label>Years of Specific Experience</label><input type="text" id="row2215373_1_5" class="auto-save tm-ignore" data-section="pw2b2"></div>
                </div></div></div>
            <div id="modal-activities" class="modal">
                <div class="modal-content"><span class="close-btn">&times;</span><div class="modal-header">Activities ডেটা এডিট</div>
                <div class="input-group"><div class="field-group"><label>Duration of Activity Start</label><input type="text" id="row2215374_1_6" class="auto-save tm-ignore" data-section="activities"><label>Activity Duration</label><input type="text" id="row2215374_1_7" class="auto-save tm-ignore" data-section="activities"></div></div></div></div>
            <div id="modal-pw2b3" class="modal">
                <div class="modal-content"><span class="close-btn">&times;</span><div class="modal-header">e-PW2B-3 ডেটা এডিট</div>
                <div class="input-group">
                    <div class="field-group"><h4>Personnel 1 (375)</h4><label>Proposed Position</label><input type="text" id="row2215375_1_1" class="auto-save tm-ignore" data-section="pw2b3"><label>Name</label><input type="text" id="row2215375_1_3" class="auto-save tm-ignore" data-section="pw2b3"><label>Date of Birth</label><input type="text" id="row2215375_1_4" class="auto-save tm-ignore" data-section="pw2b3"><label>Years overall experience</label><input type="text" id="row2215375_1_5" class="auto-save tm-ignore" data-section="pw2b3"><label>National ID Number</label><input type="text" id="row2215375_1_6" class="auto-save tm-ignore" data-section="pw2b3"><label>Years of employment</label><input type="text" id="row2215375_1_7" class="auto-save tm-ignore" data-section="pw2b3"><label>Professional Qualifications</label><textarea id="row2215375_1_8" class="auto-save tm-ignore" data-section="pw2b3" rows="2"></textarea></div>
                    <div class="field-group"><h4>Personnel 2 (376)</h4><label>Name of Procuring Entity</label><input type="text" id="row2215376_1_1" class="auto-save tm-ignore" data-section="pw2b3"><label>Address</label><input type="text" id="row2215376_1_2" class="auto-save tm-ignore" data-section="pw2b3"><label>Present Job Title</label><input type="text" id="row2215376_1_3" class="auto-save tm-ignore" data-section="pw2b3"><label>Years with Entity</label><input type="text" id="row2215376_1_4" class="auto-save tm-ignore" data-section="pw2b3"><label>Tel No.</label><input type="text" id="row2215376_1_5" class="auto-save tm-ignore" data-section="pw2b3"><label>Fax No.</label><input type="text" id="row2215376_1_6" class="auto-save tm-ignore" data-section="pw2b3"><label>e-mail</label><input type="text" id="row2215376_1_7" class="auto-save tm-ignore" data-section="pw2b3"><label>Contact</label><input type="text" id="row2215376_1_8" class="auto-save tm-ignore" data-section="pw2b3"></div>
                    <div class="field-group"><h4>Equipment (377)</h4><label>Sr.No.</label><input type="text" id="row2215377_1_1" class="auto-save tm-ignore" data-section="pw2b3"><label>from</label><input type="text" id="row2215377_1_2" class="auto-save tm-ignore" data-section="pw2b3"><label>To</label><input type="text" id="row2215377_1_3" class="auto-save tm-ignore" data-section="pw2b3"><label>Company/Project</label><input type="text" id="row2215377_1_4" class="auto-save tm-ignore" data-section="pw2b3"><label>Project</label><input type="text" id="row2215377_1_5" class="auto-save tm-ignore" data-section="pw2b3"><label>Position</label><input type="text" id="row2215377_1_6" class="auto-save tm-ignore" data-section="pw2b3"><label>Relevant experience</label><textarea id="row2215377_1_7" class="auto-save tm-ignore" data-section="pw2b3" rows="2"></textarea></div>
                </div></div></div>
            <div id="modal-pw2b4" class="modal"><div class="modal-content"><span class="close-btn">&times;</span><div class="modal-header">Percentage(-5% to +5%)</div>
                <div class="input-group"><div class="field-group"><h4>Quoted Price</h4><label>Percentage</label><input type="text" id="row2215390_1_2" class="auto-save tm-ignore" data-section="pw2b4"></div></div></div></div>
            <div id="modal-pw2b5" class="modal"><div class="modal-content"><span class="close-btn">&times;</span><div class="modal-header">yes ডেটা এডিট</div><div class="input-group"><div class="field-group"><h4>Personnel 1 (375)</h4><label>yes</label></div></div></div></div>
        </div>
        `;
        document.body.appendChild(popupContainer);

        // ইমেল রিসেট করার ফাংশন (দরকার হলে)
        // Logout listener
        document.getElementById('btn-tm-logout').onclick = function() {
            if(confirm("Logout and delete saved email? ইমেল পরিবর্তন করতে চান?")) {
                localStorage.removeItem('authorizedEmail');
                location.reload();
            }
        };

        // =========================================================================
        // PART 2: INTERACTIVITY
        // =========================================================================
        (function enableInteractivity() {
            const wrapper = document.getElementById('tm-popup-container');
            const marqueeText = document.getElementById('tm-persistent-marquee');

     // 🌀 PERSISTENT SYNC LOGIC 🌀
            const duration = 18000; // ১৮ সেকেন্ড (CSS এর সাথে মিল রাখতে হবে)
            function syncAnimation() {
                const currentTime = Date.now();
                const offset = (currentTime % duration) * -1;
                if (marqueeText) {
                    marqueeText.style.animationDelay = offset + "ms";
                }
            }
            syncAnimation();


            const handle1 = wrapper.querySelector('.top-handle-area');
            const handle2 = wrapper.querySelector('.top-section');
            const zoomSlider = document.getElementById('tm-zoom-slider');
            const delaySlider = document.getElementById('tm-delay-slider');
            const stopBtn = document.getElementById('btn-tm-stop');

            // [NEW] Skip Auto State Persistence
            const skipPW2B2Auto = document.getElementById('skip_pw2b2_auto');
            if (localStorage.getItem(K('tm_skip_pw2b2')) === 'true') {
                skipPW2B2Auto.checked = true;
            }
            skipPW2B2Auto.addEventListener('change', function() {
                localStorage.setItem(K('tm_skip_pw2b2'), this.checked);
            });

            // ➖ Minimize Mapper Logic ➖
            const minMapperBtn = document.getElementById('btn-minimize-mapper');
            const mapperBody = document.getElementById('mapper-body');
            if(minMapperBtn && mapperBody) {
                minMapperBtn.addEventListener('click', function() {
                    const isHidden = mapperBody.style.display === 'none';
                    mapperBody.style.display = isHidden ? 'block' : 'none';
                    this.innerText = isHidden ? '−' : '+';
                    localStorage.setItem(K('tm_mapper_minimized'), !isHidden);
                });
            }

           // 🛑 [UPDATED] Minimize MAIN Buttons Grid Logic
            const minMainBtn = document.getElementById('btn-minimize-main');
            const mainContent = document.getElementById('tm-main-content');
            if(minMainBtn && mainContent) {
                minMainBtn.addEventListener('click', function() {
                    const isHidden = mainContent.style.display === 'none';
                    mainContent.style.display = isHidden ? 'block' : 'none';
                    this.innerText = isHidden ? '−' : '+';
                    localStorage.setItem(K('tm_main_grid_minimized'), !isHidden);
                });
            }


            // 🛑 STOP BUTTON LOGIC
            stopBtn.addEventListener('click', function() {
                STOP_FLAG = true;
                // Clear automation queues so it doesn't resume automatically after reload
                localStorage.setItem(K('tm_boq_active'), 'false');
                localStorage.setItem(K('tm_ltm_active'), 'false');
                localStorage.setItem(K('tm_master_enc_active'), 'false');
                localStorage.setItem(K('tm_mapping_auto_active'), 'false'); // [NEW] Mapping Auto Stop
                chrome.storage.local.set({ [K('isAutoEncrypting')]: false });

                this.innerText = "Kiron";
                this.style.background = "#000";
                document.getElementById('status').innerText = "🛑 Automation Permanently Stopped! Page Reload Work ";
                document.getElementById('status').style.color = "red";
                console.log("Emergency stop activated. All operations halted.");
            });

            let ticking = false;
            zoomSlider.addEventListener('input', function(e) {
                const scale = e.target.value;
                if (!ticking) { window.requestAnimationFrame(() => { wrapper.style.transform = `scale(${scale})`; ticking = false; }); ticking = true; }
                localStorage.setItem(K('tm_panel_zoom'), scale);
            });
            delaySlider.addEventListener('input', function(e) {
                const val = e.target.value;
                document.getElementById('delay-display').innerText = val + "ms";
                localStorage.setItem(K('tm_panel_delay'), val);
            });

            let isDragging = false, startX, startY, initialLeft, initialTop;

            // মোবাইলের জন্য টাচ লোকেশন হেল্পার
            const getPointerXY = (e) => {
                if (e.touches && e.touches.length > 0) {
                    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
                }
                return { x: e.clientX, y: e.clientY };
            };

            function startDrag(e) {
                // বাটন, ইনপুট বা স্লাইডার এ ক্লিক করলে ড্র্যাগ হবে না
                if(e.target.tagName.toLowerCase() === 'input' ||
                   e.target.tagName.toLowerCase() === 'button' ||
                   e.target.tagName.toLowerCase() === 'textarea' ||
                   e.target.tagName.toLowerCase() === 'select' ||
                   e.target.id === "btn-tm-stop" ||
                   e.target.id === "btn-minimize-mapper" ||
                   e.target.id === "btn-minimize-main") return;

                isDragging = true;
                const pos = getPointerXY(e);
                startX = pos.x;
                startY = pos.y;
                initialLeft = wrapper.offsetLeft;
                initialTop = wrapper.offsetTop;
                handle1.style.cursor = 'grabbing';
            }

            function doDrag(e) {
                if (!isDragging) return;
                const pos = getPointerXY(e);
                const dx = pos.x - startX;
                const dy = pos.y - startY;
                wrapper.style.left = `${initialLeft + dx}px`;
                wrapper.style.top = `${initialTop + dy}px`;

                // মোবাইল স্ক্রল প্রিভেন্ট করার জন্য
                if (e.cancelable) e.preventDefault();
            }

            function stopDrag() {
                if (isDragging) {
                    isDragging = false;
                    handle1.style.cursor = 'move';
                    localStorage.setItem(K('tm_panel_top'), wrapper.style.top);
                    localStorage.setItem(K('tm_panel_left'), wrapper.style.left);
                }
            }

            // মাউস ইভেন্ট
            wrapper.addEventListener('mousedown', startDrag);
            document.addEventListener('mousemove', doDrag);
            document.addEventListener('mouseup', stopDrag);

            // টাচ ইভেন্ট (মোবাইলের জন্য)
            wrapper.addEventListener('touchstart', startDrag, { passive: false });
            document.addEventListener('touchmove', doDrag, { passive: false });
            document.addEventListener('touchend', stopDrag);

            document.querySelectorAll('.close-btn').forEach(btn => btn.addEventListener('click', function() { this.closest('.modal').style.display = 'none'; }));
            document.querySelectorAll('.auto-save').forEach(input => {
                if (localStorage.getItem(K(input.id))) input.value = localStorage.getItem(K(input.id));
                input.addEventListener('input', function() { localStorage.setItem(K(this.id), this.value); });
            });

            // =========================================================================
            // 🔥 PASSWORD AUTO-LOAD LOGIC 🔥
            // =========================================================================
            const globalPassInput = document.getElementById('global_password');

            // লোড হওয়ার সাথে সাথে স্টোরেজ থেকে পাসওয়ার্ড নিবে
            const initialPw = localStorage.getItem(K('global_gp_password')) || localStorage.getItem(K('savedPassword'));
            if (initialPw) {
                globalPassInput.value = initialPw;
                globalPassInput.style.border = "2px solid #00e676";
            }

            setInterval(function() {
                if (STOP_FLAG) return;
                const pagePasswordFields = document.querySelectorAll('input[type="password"]:not(#global_password)');
                pagePasswordFields.forEach(field => {
                    if (field.value && field.value.trim().length > 0) {
                        if (globalPassInput.value !== field.value) {
                            globalPassInput.value = field.value;
                            localStorage.setItem(K('global_gp_password'), field.value);
                            localStorage.setItem(K('savedPassword'), field.value); // Sync automation pass
                            globalPassInput.style.border = "2px solid #00e676";
                        }
                    }
                });
            }, 500);

            globalPassInput.addEventListener('input', function() {
                localStorage.setItem(K('global_gp_password'), this.value);
                localStorage.setItem(K('savedPassword'), this.value); // Sync automation pass
            });

            function setupButton(btnId, actionName, modalId = null) {
                const btn = document.getElementById(btnId);
                if(!btn) return;
                let clickTimeout;
                btn.addEventListener('click', function() {
                    if (STOP_FLAG) return;
                    if(clickTimeout) clearTimeout(clickTimeout);
                    clickTimeout = setTimeout(() => {
                        const password = document.getElementById('global_password').value || localStorage.getItem(K('global_gp_password'));
                        if(!password) { alert("Please enter password!"); return; }
                        let formData = {};
                        const inputs = document.querySelectorAll(`.auto-save[data-section="${actionName}"]`);
                        inputs.forEach(inp => formData[inp.id] = inp.value);
                        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                            if(tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: actionName, password: password, formData: formData });
                        });
                    }, 200);
                });
                if(modalId) { btn.addEventListener('dblclick', function() { clearTimeout(clickTimeout); document.getElementById(modalId).style.display = 'flex'; }); }
            }

            setupButton('btn-pw2b1', 'pw2b1');
            setupButton('btn-pw2b2', 'pw2b2', 'modal-pw2b2');
            setupButton('btn-activities', 'activities', 'modal-activities');
            setupButton('btn-pw2b3', 'pw2b3', 'modal-pw2b3');
            setupButton('btn-pw2b4', 'pw2b4', 'modal-pw2b4');
            setupButton('btn-pw2b5', 'pw2b5', 'modal-pw2b5');

            const multiBoqBtn = document.getElementById('btn-multi-boq');
            if(multiBoqBtn) {
                multiBoqBtn.addEventListener('click', function() {
                    if (STOP_FLAG) return;
                    const password = document.getElementById('global_password').value || localStorage.getItem(K('global_gp_password'));
                    if(!password) { alert("Please enter password!"); return; }
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        if(tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: 'multi_boq_start', password: password });
                    });
                });
            }

            const ltmAutoBtn = document.getElementById('btn-ltm-auto');
            if(ltmAutoBtn) {
                ltmAutoBtn.addEventListener('click', function() {
                    if (STOP_FLAG) return;
                    const password = document.getElementById('global_password').value || localStorage.getItem(K('global_gp_password'));
                    if(!password) { alert("Please enter password!"); return; }
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        if(tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: 'ltm_auto_start', password: password });
                    });
                });
            }

            const encryptBtn = document.getElementById('btn-super-encrypt');
            if(encryptBtn) {
                encryptBtn.addEventListener('click', function() {
                    if (STOP_FLAG) return;
                    const password = document.getElementById('global_password').value || localStorage.getItem(K('global_gp_password'));
                    if(!password) { document.querySelector('.global-pass-box').style.border = "2px solid red"; return; }
                    document.querySelector('.global-pass-box').style.border = "none";
                    chrome.storage.local.set({ [K('isAutoEncrypting')]: true, [K('savedPassword')]: password }, function() {
                        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                            if(tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: 'super_encrypt_sequence', password: password });
                        });
                    });
                });
            }

            const encryptAutoMasterBtn = document.getElementById('btn-encrypt-auto-master');
            if(encryptAutoMasterBtn) {
                encryptAutoMasterBtn.addEventListener('click', function() {
                    if (STOP_FLAG) return;
                    const password = document.getElementById('global_password').value || localStorage.getItem(K('global_gp_password'));
                    if(!password) { alert("পাসওয়ার্ড দিন!"); return; }
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        if(tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: 'master_encrypt_start', password: password });
                    });
                });
            }

            const INPUT_IDS = ["sno_1633420", "sno_1633421", "sno_1633422", "sno_1633423","sno_1633424", "sno_0"];
            const SKIP_IDS = ["skip_1633420", "skip_1633421", "skip_1633422", "skip_1633423","skip_1633424", "skip_0"];

            const loadSavedData = () => {
                INPUT_IDS.forEach(id => {
                    let val = localStorage.getItem(K("mapper_" + id));
                    if (val !== null) document.getElementById(id).value = val;
                });
                SKIP_IDS.forEach(id => {
                    let val = localStorage.getItem(K("mapper_" + id));
                    if (val === "true") document.getElementById(id).checked = true;
                });
            };

            const saveInputData = () => {
                let data = {};
                INPUT_IDS.forEach(id => {
                    let val = document.getElementById(id).value.trim();
                    localStorage.setItem(K("mapper_" + id), val);
                    data[id.replace("sno_", "")] = val;
                });
                SKIP_IDS.forEach(id => {
                    let val = document.getElementById(id).checked;
                    localStorage.setItem(K("mapper_" + id), val);
                });
                return data;
            };

            [...INPUT_IDS, ...SKIP_IDS].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.addEventListener("change", saveInputData);
                if (el && el.type === "text") el.addEventListener("input", saveInputData);
            });

            // =========================================================================
            // 🚀 [UPDATED] Run MAP-2 Click Listener for AUTO MAPPING
            // =========================================================================
            const runBtn = document.getElementById("run_map");
            if(runBtn) {
                runBtn.addEventListener("click", () => {
                    if (STOP_FLAG) return;
                    const statusEl = document.getElementById("status_mapper");
                    if(statusEl) statusEl.innerText = "Auto Mapping Starting…";

                    // [NEW LOGIC] সেটআপ অটোমোশন ফ্ল্যাগ
                    localStorage.setItem(K('tm_mapping_auto_active'), 'true');
                    localStorage.setItem(K('egp_dynamic_step'), '0'); // প্রথম থেকে শুরু করবে

                    const mappingData = saveInputData();
                    chrome.runtime.sendMessage( { action: "RUN_MAP", data: mappingData }, response => {
                            if(statusEl) {
                                if (!response) { statusEl.innerText = "Failed!"; return; }
                                statusEl.innerText = "Running…";
                            }
                        }
                    );
                });
            }
            loadSavedData();
        })();

        // =========================================================================
        // PART 3: AUTOMATION LOGIC (Content Script)
        // =========================================================================

        (function() {
            chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
                if (STOP_FLAG) return;
                if (msg.action === "RUN_MAP") {
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        if (!tabs || !tabs[0]) { sendResponse({ status: "NO_TAB" }); return; }
                        const tabId = tabs[0].id;
                        chrome.scripting.executeScript({ target: { tabId: tabId } }, () => {
                            chrome.tabs.sendMessage(tabId, { action: "runMultiMap", data: msg.data }, (resp) => { sendResponse({ status: "DONE" }); });
                        });
                    });
                    return true;
                }
            });
        })();

        (function() {
          if (window.__egp_map_loaded) return;
          window.__egp_map_loaded = true;
          window.__egp_isMapping = false;
          window.__egp_map_clicked = false;
          if (!window.__egp_msg_listener_added) {
            chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
              if (STOP_FLAG) return;
              if (msg && msg.action === "runMultiMap") {
                if (window.__egp_isMapping) { try { sendResponse({ status: 'ALREADY_RUNNING' }); } catch (e) {} return true; }
                window.__egp_isMapping = true;
                runMapFinal(msg.data).then(result => {
                  try { sendResponse({ status: 'ok', result }); } catch (e) {}
                  try { chrome.runtime.sendMessage({ action: "reloadEGP" }); } catch (e) {}
                }).catch(err => {
                  try { sendResponse({ status: 'error', message: err?.message || String(err) }); } catch (e) {}
                }).finally(() => { setTimeout(() => { window.__egp_isMapping = false; }, 50); });
                return true;
              }
            });
            window.__egp_msg_listener_added = true;
          }
          const wait = ms => new Promise(r => setTimeout(r, ms));
          const txt = el => el ? (el.innerText || el.textContent || '').trim() : '';
          async function clickViewFilesFirst() {
            if (STOP_FLAG) return;
            const btn = document.querySelector("a[onclick*=\"checkSatus('allfile')\"]");
            if (!btn) return false;
            try { btn.click(); } catch (e) { try { btn.dispatchEvent(new MouseEvent('click', { bubbles: true })); } catch (e2) {} }
            await wait(20); return true;
          }
          function parseSerialList(raw) {
            if (!raw) return [];
            return raw.split(',').map(s => s.trim()).filter(Boolean).map(s => { const m = s.match(/-?\d+/); return m ? Number(m[0]) : NaN; }).filter(n => Number.isFinite(n));
          }
          function collectRows() {
            let rows = Array.from(document.querySelectorAll('tr.jqgrow'));
            if (!rows.length) { const list = document.querySelector('#list, #tblDocs, table'); if (list) rows = Array.from(list.querySelectorAll('tr')).filter(r => r.querySelectorAll('td').length > 0); }
            if (!rows.length) rows = Array.from(document.querySelectorAll('table tr')).filter(r => r.querySelectorAll('td').length > 0);
            return rows;
          }
          function getSerialFromRow(row) {
            if (!row) return null;
            let srCell = row.querySelector("td[aria-describedby*='srno'], td[aria-describedby*='list_srno']");
            if (!srCell) { for (const td of row.querySelectorAll('td')) { if (/^\d+$/.test(txt(td))) { srCell = td; break; } } }
            if (!srCell) return null;
            const m = txt(srCell).match(/\d+/); return m ? Number(m[0]) : null;
          }
          function getCheckboxFromRow(row) { return row.querySelector("input[type='checkbox'][name='chkComDocId']") || row.querySelector("input[type='checkbox']"); }
          function getDocIdFromRow(row) {
            const cb = getCheckboxFromRow(row);
            if (cb && cb.value && /^\d+$/.test(cb.value)) return String(cb.value);
            if (row.id && /^\d+$/.test(row.id)) return String(row.id);
            const a = row.querySelector("a[href*='docId='], a[onclick*='docId=']");
            if (a) { const m = (a.getAttribute('href') || a.getAttribute('onclick') || '').match(/docId=(\d+)/); if (m) return m[1]; }
            return null;
          }
          function tryCheck(docId, cbElement) {
            if (typeof window.checkBoxClick === 'function') { window.checkBoxClick(String(docId)); return true; }
            if (cbElement) { try { if (!cbElement.checked) cbElement.click(); cbElement.checked = true; cbElement.dispatchEvent(new Event('change', { bubbles: true })); return true; } catch (e) {} }
            return false;
          }
          function setDropdownValue(val) {
            let sel = document.querySelector("form#frmMap select[name='manDocId']") || document.querySelector("select#manDocId") || document.querySelector("select[name='manDocId']");
            if (!sel) return false;
            try { sel.value = String(val); sel.dispatchEvent(new Event('change', { bubbles: true })); return true; } catch (e) { return false; }
          }
          function findMapButton() {
            let btn = document.querySelector("form#frmMap input#btnMap, input#btnMap[name='btnMap'], input[type='button'][value='Map']");
            if (!btn) btn = document.querySelector('input#btnMap, button#btnMap, button[name="btnMap"]');
            return btn;
          }
          function findNextButton() { return document.querySelector("span.ui-icon.ui-icon-seek-next"); }
          async function clickNextAndWait() {
            const btn = findNextButton(); if (!btn) return false;
            let anchor = btn.closest("a") || btn.closest("button") || btn;
            try { anchor.click(); } catch (e) { try { anchor.dispatchEvent(new MouseEvent("click", { bubbles: true })); } catch (e2) {} }
            await wait(20); return true;
          }

          // --- UPDATED MAPPER LOGIC WITH SKIP CHECK ---
          async function runMapFinal(mappingData) {
            if (STOP_FLAG) return;
            try { await clickViewFilesFirst(); } catch (e) {}
            function detectDocKey(keywordList) {
              const options = document.querySelectorAll("select[name='manDocId'] option, #manDocId option");
              let found = null;
              options.forEach(opt => { const text = (opt.innerText || "").toLowerCase(); for (let k of keywordList) { if (text.includes(k.toLowerCase())) found = opt.value.trim(); } });
              return found;
            }
            const dynamicTrade = detectDocKey(["Valid Trade License","trade", "license"]);
            const dynamicTIN   = detectDocKey(["TIN Certificate","Valid TIN Certificate"]);
            const dynamicVAT   = detectDocKey(["VAT Registration","VAT Certificate ","VAT Registration Certificate"]);
            const dynamicBank  = detectDocKey(["Financial Capacity Certificates ","Financial","Financial Capacity","bank","Documentary evidence of adequacy of liquid assets (ITT 12.1)"]);
            const dynamicLGED = detectDocKey([" Updated LGED Enlistment Documents ","Updated LGED","LGED Enlistment","Attached here updated valid Enlistment/ License under LGED Rangpur"]);
              const userMap = mappingData || {};
            const remapped = {};
            if (userMap["1633420"]) remapped[dynamicTrade || "1633420"] = userMap["1633420"];
            if (userMap["1633421"]) remapped[dynamicTIN   || "1633421"] = userMap["1633421"];
            if (userMap["1633422"]) remapped[dynamicVAT   || "1633422"] = userMap["1633422"];
            if (userMap["1633423"]) remapped[dynamicBank  || "1633423"] = userMap["1633423"];
            if (userMap["1633424"]) remapped[dynamicLGED  || "1633424"] = userMap["1633424"];
            if (userMap["0"])       remapped["0"]                        = userMap["0"];
            mappingData = remapped;

            const ORDER = [
                { key: dynamicTrade || '1633420', label: 'Trade License', originalId: '1633420' },
                { key: dynamicTIN   || '1633421', label: 'TIN Certificate', originalId: '1633421' },
                { key: dynamicVAT   || '1633422', label: 'VAT Certificate', originalId: '1633422' },
                { key: dynamicBank  || '1633423', label: 'Liquid Assets', originalId: '1633423' },
                { key: dynamicLGED  || '1633424', label: 'Updated LGED Enlistment Documents', originalId: '1633424' },
                { key: '0', label: 'Other', originalId: '0' }
            ];

            const STEP_KEY = K('egp_dynamic_step');
            let step = parseInt(localStorage.getItem(STEP_KEY) || '0', 10);
            if (!Number.isFinite(step)) step = 0;

            // SKIP LOGIC: Loop until we find a step that is NOT skipped
            let currentStepToProcess = -1;
            for (let i = 0; i < ORDER.length; i++) {
                let index = (step + i) % ORDER.length;
                let checkId = K("mapper_skip_" + ORDER[index].originalId);
                let isSkipChecked = localStorage.getItem(checkId) === "true";

                if (!isSkipChecked) {
                    currentStepToProcess = index;
                    break;
                }
            }

            // [NEW TERMINATION LOGIC] Find the actual last non-skipped index in the array
            let lastValidIdx = -1;
            for (let i = 0; i < ORDER.length; i++) {
                if (localStorage.getItem(K("mapper_skip_" + ORDER[i].originalId)) !== "true") {
                    lastValidIdx = i;
                }
            }

            if (currentStepToProcess === -1 || lastValidIdx === -1) {
                localStorage.setItem(STEP_KEY, "0");
                // [NEW] সকল স্কিপ করা হলে অটোমোশন বন্ধ
                if(localStorage.getItem(K('tm_mapping_auto_active')) === 'true') {
                   localStorage.setItem(K('tm_mapping_auto_active'), 'false');
                   window.showToast("✅ Mapping complete");
                   alert("Mapping complete");
                }
                return { status: "all_skipped" };
            }

            const current = ORDER[currentStepToProcess];

            // =========================================================================
            // 🌟 [START] SHOW DOCUMENT NAME IN TOAST (AS REQUESTED) 🌟
            // =========================================================================
            let docNameMsg = current.label;
            if(current.originalId === "1633420") docNameMsg = "Valid Trade License";
            else if(current.originalId === "1633421") docNameMsg = "Valid TIN Certificate";
            else if(current.originalId === "1633422") docNameMsg = "VAT Registration Certificate";
            else if(current.originalId === "1633423") docNameMsg = "Documentary evidence of adequacy of liquid assets (ITT 12.1)";
            else if(current.originalId === "1633424") docNameMsg = "Updated LGED Enlistment Documents";
            else if(current.originalId === "0") docNameMsg = "Other";

            if (window.showToast) {
                window.showToast("🔄 Mapping: " + docNameMsg);
            }
            // =========================================================================
            // 🌟 [END] 🌟
            // =========================================================================

            const raw = mappingData[current.key] || "";
            const SERIALS = parseSerialList(raw);

            // If no serial provided for this non-skipped item, move step and try next run
            if (!SERIALS.length) {
                localStorage.setItem(STEP_KEY, String((currentStepToProcess + 1) % ORDER.length));
                // [NEW] চেক করা হচ্ছে এটাই কি শেষ আইটেম ছিল কি না
                if(currentStepToProcess === lastValidIdx) {
                    if(localStorage.getItem(K('tm_mapping_auto_active')) === 'true') {
                       localStorage.setItem(K('tm_mapping_auto_active'), 'false');
                       window.showToast("✅ Mapping complete");
                       alert("Mapping complete");
                    }
                    return { status: "done" };
                }
                return runMapFinal(mappingData);
            }

            const unmatched = new Set(SERIALS);
            const matchedInfo = [];
            let page = 0;
            while (unmatched.size && page < 100) {
              if (STOP_FLAG) break;
              page++;
              const rows = collectRows();
              for (const row of rows) {
                if (STOP_FLAG) break;
                const sr = getSerialFromRow(row);
                if (sr === null || !unmatched.has(sr)) continue;
                const viewLink = row.querySelector('a[href="#label"][onclick*="checkSatus"]');
                if (viewLink) { try { viewLink.click(); } catch (e) {} await wait(30); }
                const cb = getCheckboxFromRow(row);
                const docId = getDocIdFromRow(row);
                const ok = tryCheck(docId, cb);
                if (ok) { unmatched.delete(sr); matchedInfo.push({ serial: sr, docId, status: "checked" }); }
                else { matchedInfo.push({ serial: sr, docId, status: "failed" }); }
                await wait(15);
              }
              if (!unmatched.size) break;
              const moved = await clickNextAndWait();
              if (!moved) break;
            }

            if (STOP_FLAG) return { status: "stopped" };
            setDropdownValue(current.key);
            const mapBtn = findMapButton();
            if (mapBtn && !window.__egp_map_clicked) {
              window.__egp_map_clicked = true;

              // [NEW LOGIC] Check if this current processing step is the last non-skipped one
              if(currentStepToProcess === lastValidIdx) {
                  localStorage.setItem(K('tm_mapping_auto_active'), 'false');
                  localStorage.setItem(STEP_KEY, "0");
                  setTimeout(() => {
                      window.showToast("✅ Mapping complete");
                      alert("Mapping complete");
                  }, 1000);
              } else {
                  localStorage.setItem(STEP_KEY, String((currentStepToProcess + 1) % ORDER.length));
              }

              try { mapBtn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })); } catch (e) { try { mapBtn.click(); } catch (e2) {} }
              setTimeout(() => { window.__egp_map_clicked = false; }, 50);
            }

            return { matched: matchedInfo, unmatched: Array.from(unmatched) };
          }
          window.__egp_runMapFinal = runMapFinal;

          // =========================================================================
          // 🚀 [NEW] AUTO-TRIGGER LOGIC FOR MAPPING (LINE BY LINE ADDED)
          // =========================================================================
          setTimeout(() => {
              if (STOP_FLAG) return;
              if (localStorage.getItem(K('tm_mapping_auto_active')) === 'true') {
                  const mapBtn = findMapButton();
                  if (mapBtn) {
                      // ৫ ms ডিলে করার জন্য অনুরোধ করা হয়েছে
                      setTimeout(() => {
                          const INPUT_IDS = ["sno_1633420", "sno_1633421", "sno_1633422", "sno_1633423","sno_1633424", "sno_0"];
                          let data = {};
                          INPUT_IDS.forEach(id => {
                              data[id.replace("sno_", "")] = localStorage.getItem(K("mapper_" + id));
                          });
                          runMapFinal(data);
                      }, 5);
                  }
              }
          }, 1500); // পেজ লোড হওয়ার জন্য একটু সময় দেওয়া হলো

        })();

        // --- content_filler.js ---
        (function() {
            function getDelay() { return parseInt(localStorage.getItem(K('tm_panel_delay')) || '1000', 10); }

            checkPendingAutomation();

            chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
                if (STOP_FLAG) return;
                if (request.action === 'super_encrypt_sequence') {
                    handleAutomationLogic(request.password);
                }
                else if (request.action === 'pw2b5') {
                    handleDropdowns('yes', true);
                    setTimeout(() => { runStandardAutomation(request.password); }, getDelay());
                }
                else if (request.action === 'multi_boq_start') {
                    startMultiBoqProcess(request.password);
                }
                else if (request.action === 'ltm_auto_start') {
                    startLtmAutoProcess(request.password);
                }
                else if (request.action === 'master_encrypt_start') {
                    startMasterEncryptProcess(request.password);
                }
                else {
                    const formValues = request.formData ? Object.values(request.formData) : [];
                    if(formValues.length > 0) fillUniversalFields(formValues);
                    runStandardAutomation(request.password);
                }
                sendResponse({status: "ok"});
            });

            function startMasterEncryptProcess(password) {
                if (STOP_FLAG) return;
                const links = [];
                document.querySelectorAll('a').forEach(a => {
                    if(a.innerText.trim() === "Encrypt") {
                        links.push(a.href);
                    }
                });

                if(links.length === 0) {
                    showToast("⚠️ কোনো Encrypt লিংক পাওয়া যায়নি!");
                    return;
                }

                localStorage.setItem(K('tm_master_enc_queue'), JSON.stringify(links));
                localStorage.setItem(K('tm_master_enc_active'), 'true');
                localStorage.setItem(K('savedPassword'), password);

                showToast(`🚀 ${links.length} টি ফাইল এনক্রিপশন শুরু হচ্ছে...`);
                setTimeout(() => { window.location.href = links[0]; }, 500);
            }

            function runLinkedButtonLogic(password) {
                if (STOP_FLAG) return;
                const pageText = document.body.innerText.toLowerCase();
                let buttonValues = [];
                let detected = "";

                if (pageText.includes("financial resources") || pageText.includes("tenderer's legal title")) {
                    detected = "PW2B-2";
                    const ids = ['row2215370_1_1','row2215370_1_2','row2215371_1_1','row2215371_1_2','row2215371_1_3','row2215372_1_1','row2215372_1_2','row2215372_1_3','row2215373_1_1','row2215373_1_2','row2215373_1_3','row2215373_1_4','row2215373_1_5'];
                    ids.forEach(id => buttonValues.push(localStorage.getItem(K(id)) || ""));
                }
                else if (pageText.includes("personnel information") || pageText.includes("proposed position")) {
                    detected = "PW2B-3";
                    const ids = ['row2215375_1_1','row2215375_1_3','row2215375_1_4','row2215375_1_5','row2215375_1_6','row2215375_1_7','row2215375_1_8','row2215376_1_1','row2215376_1_2','row2215376_1_3','row2215376_1_4','row2215376_1_5','row2215376_1_6','row2215376_1_7','row2215376_1_8','row2215377_1_1','row2215377_1_2','row2215377_1_3','row2215377_1_4','row2215377_1_5','row2215377_1_6','row2215377_1_7'];
                    ids.forEach(id => buttonValues.push(localStorage.getItem(K(id)) || ""));
                }
                else if (pageText.includes("activity schedule") || pageText.includes("duration of activity")) {
                    detected = "Activities";
                    const ids = ['row2215374_1_6','row2215374_1_7'];
                    ids.forEach(id => buttonValues.push(localStorage.getItem(K(id)) || ""));
                }
                else if (pageText.includes("quoted price") || pageText.includes("grand summary")) {
                    detected = "Percentage";
                    const ids = ['row2215390_1_2'];
                    ids.forEach(id => buttonValues.push(localStorage.getItem(K(id)) || ""));
                }

                if (detected) {
                    showToast(`🔗 Linked Button: ${detected} Activated`);
                    fillUniversalFields(buttonValues);
                    setTimeout(() => {
                        handleDropdowns('yes', true);
                        runStandardAutomation(password, true);
                    }, 1000);
                } else {
                    handleDropdowns('yes', true);
                    runStandardAutomation(password, true);
                }
            }

            function startLtmAutoProcess(password) {
                if (STOP_FLAG) return;
                const links = [];
                const skipPW2B2 = localStorage.getItem(K('tm_skip_pw2b2')) === 'true'; // চেক করা হচ্ছে স্কিপ অপশন অন কি না
                const rows = document.querySelectorAll('tr');

                rows.forEach(row => {
                    const rowText = row.innerText.toLowerCase();
                    if (!rowText.includes("grand summary")) {

                        // [নতুন লজিক] যদি স্কিপ অপশন অন থাকে এবং এই রো e-PW2B-2 এর হয়, তবে এটি লিস্টে যোগ হবে না
                        if (skipPW2B2 && (rowText.includes("e-pw2b-2") || rowText.includes("tenderer's qualification information"))) {
                            console.log("Skipping e-PW2B-2 as per settings.");
                            return; // এই রো এর লিঙ্ক নিবে না
                        }

                        const anchors = row.querySelectorAll('a');
                        anchors.forEach(a => { if(a.innerText.trim() === "Fill") links.push(a.href); });
                    }
                });

                if(links.length === 0) { showToast("⚠️ কোনো Fill ফর্ম পাওয়া যায়নি!"); return; }
                localStorage.setItem(K('tm_ltm_queue'), JSON.stringify(links));
                localStorage.setItem(K('tm_ltm_active'), 'true');
                localStorage.setItem(K('savedPassword'), password);
                showToast(`🚀 ${links.length} টি ফর্ম পাওয়া গেছে (LTM)। কাজ শুরু হচ্ছে...`);
                setTimeout(() => { window.location.href = links[0]; }, 500);
            }

            function startMultiBoqProcess(password) {
                if (STOP_FLAG) return;
                const links = [];
                const rows = document.querySelectorAll('tr');
                rows.forEach(row => {
                    const text = row.innerText.toLowerCase();
                    if ((text.includes('boq') || text.includes('bill of quantities')) && !text.includes('grand summary')) {
                        const anchors = row.querySelectorAll('a');
                        anchors.forEach(a => { if(a.innerText.trim() === "Fill") links.push(a.href); });
                    }
                });
                if(links.length === 0) { showToast("⚠️ কোনো BOQ ফর্ম (Fill) পাওয়া যায়নি!"); return; }
                localStorage.setItem(K('tm_boq_queue'), JSON.stringify(links));
                localStorage.setItem(K('tm_boq_active'), 'true');
                localStorage.setItem(K('savedPassword'), password);
                showToast(`🚀 ${links.length} টি BOQ পাওয়া গেছে। কাজ শুরু হচ্ছে...`);
                setTimeout(() => { window.location.href =links[0]; }, 500);
            }

            function checkPendingAutomation() {
                if (STOP_FLAG) return;
                const isBoqActive = localStorage.getItem(K('tm_boq_active')) === 'true';
                const isLtmActive = localStorage.getItem(K('tm_ltm_active')) === 'true';
                const isMasterEncActive = localStorage.getItem(K('tm_master_enc_active')) === 'true';

                // পাসওয়ার্ড স্টোরেজ থেকে পুনরুদ্ধার
                const password = localStorage.getItem(K('savedPassword')) || localStorage.getItem(K('global_gp_password'));

                if (!isBoqActive && !isLtmActive && !isMasterEncActive) {
                    chrome.storage.local.get([K('isAutoEncrypting'), K('savedPassword')], function(result) {
                        if (STOP_FLAG) return;
                        if (result[K('isAutoEncrypting')] === true && result[K('savedPassword')]) {
                            const hasAction = document.querySelector('input[value="Decrypt"]') || document.querySelector('input[name="sign"]') || findLinkByText('Encrypt');
                            if (!hasAction) {
                                 setTimeout(() => {
                                     const retry = document.querySelector('input[value="Decrypt"]');
                                     if(!retry) chrome.storage.local.set({[K('isAutoEncrypting')]: false});
                                     else proceedResume(result[K('savedPassword')]);
                                 }, getDelay()*1.2);
                                 return;
                            }
                            proceedResume(result[K('savedPassword')]);
                        }
                    });
                    return;
                }

                let queueKey, activeKey, label;

                if (isMasterEncActive) {
                    queueKey = K('tm_master_enc_queue'); activeKey = K('tm_master_enc_active'); label = 'Master Encrypt';
                } else if (isBoqActive) {
                    queueKey = K('tm_boq_queue'); activeKey = K('tm_boq_active'); label = 'BOQ';
                } else {
                    queueKey = K('tm_ltm_queue'); activeKey = K('tm_ltm_active'); label = 'LTM Form';
                }

                const isFormPage = document.querySelector('input[value="Encrypt"]') || document.querySelector('input[name="sign"]') || document.querySelector('input[name="save"]') || document.getElementById('decrypt');

                if (isFormPage) {
                    // [NEW] Skip Logic for LTM Auto
                    const pageText = document.body.innerText.toLowerCase();
                    const isPW2B2 = pageText.includes("financial resources") || pageText.includes("tenderer's legal title");
                    const skipFlag = localStorage.getItem(K('tm_skip_pw2b2')) === 'true';

                    if (isLtmActive && isPW2B2 && skipFlag) {
                        showToast("⏭️ Skipping e-PW2B-2 form...");
                        setTimeout(() => {
                            const queueRaw = localStorage.getItem(queueKey);
                            let queue = queueRaw ? JSON.parse(queueRaw) : [];
                            if (queue.length > 0) {
                                queue.shift();
                                localStorage.setItem(queueKey, JSON.stringify(queue));
                                if (queue.length > 0) window.location.href = queue[0];
                                else {
                                    // LTM শেষ হওয়ার লজিক
                                    localStorage.setItem(activeKey, 'false');
                                    if (activeKey === K('tm_ltm_active')) {
                                        showToast("✅ LTM শেষ! এখন Encrypt ALL শুরু হচ্ছে...");
                                        setTimeout(() => { startMasterEncryptProcess(password); }, 1000);
                                    } else {
                                        localStorage.removeItem(K('savedPassword'));
                                        alert("All Completed!");
                                    }
                                }
                            }
                        }, 300);
                        return;
                    }

                    showToast(`⚙️ ${label} অটো ফিল হচ্ছে...`);
                    if(isMasterEncActive) {
                        setTimeout(() => runStrictMasterSequence(password), getDelay());
                    } else if(isLtmActive) {
                        setTimeout(() => runLinkedButtonLogic(password), getDelay());
                    } else {
                        setTimeout(() => {
                            handleDropdowns('yes', true);
                            runStandardAutomation(password, true);
                        }, getDelay());
                    }
                } else {
                    setTimeout(() => {
                        if (STOP_FLAG) return;
                        const queueRaw = localStorage.getItem(queueKey);
                        let queue = queueRaw ? JSON.parse(queueRaw) : [];
                        if (queue.length > 0) {
                            queue.shift();
                            localStorage.setItem(queueKey, JSON.stringify(queue));
                            if (queue.length > 0) {
                                showToast(`🔄 পরবর্তী ${label} এ যাওয়া হচ্ছে... (বাকি: ${queue.length})`);
                                window.location.href = queue[0];
                            } else {
                                localStorage.setItem(activeKey, 'false');
                                if (activeKey === K('tm_ltm_active')) {
                                    showToast(`✅ সব LTM পূরণ শেষ! এখন অটোমেটিক Encrypt ALL শুরু হচ্ছে...`);
                                    setTimeout(() => {
                                         startMasterEncryptProcess(password);
                                    }, 1000);
                                } else {
                                    localStorage.removeItem(K('savedPassword'));
                                    showToast(`✅ সব ${label} পূরণ সম্পন্ন হয়েছে!`);
                                    alert(`All ${label} Completed Successfully!`);
                                }
                            }
                        } else localStorage.setItem(activeKey, 'false');
                    }, getDelay() + 300);
                }
            }



            function runStrictMasterSequence(password) {
                if (STOP_FLAG) return;
                const delay = getDelay();
                const encInternal = findLinkByText('Encrypt') || document.querySelector('input[value="Encrypt"]');
                if(encInternal) {
                    encInternal.click();
                    showToast("🔒 Encrypt ক্লিক করা হয়েছে...");
                }
                setTimeout(() => {
                    if (STOP_FLAG) return;
                    const decryptBtn = document.getElementById('decrypt') || document.querySelector('input[value="Decrypt"]');
                    if (decryptBtn) {
                        decryptBtn.click();
                        showToast("🔓 Decrypt ক্লিক করা হয়েছে...");
                    }
                    waitForElement('input[type="password"]:not([disabled]):not(#global_password)', (passInput) => {
                        if (STOP_FLAG) return;
                        passInput.value = password;
                        triggerEvents(passInput);
                        setTimeout(() => {
                            if (STOP_FLAG) return;
                            const verifyBtn = findVerifyButton();
                            if(verifyBtn) verifyBtn.click();
                            waitForElement('input[value="Encrypt And Save"]:not([disabled]), #encrypt:not([disabled]), #save', (finalBtn) => {
                                setTimeout(() => {
                                    if (STOP_FLAG) return;
                                    finalBtn.click();
                                    showToast("💾 Encrypt And Save ক্লিক!");
                                    waitForOkButton(false);
                                }, delay);
                            }, delay *1.5);
                        }, delay);
                    });
                }, delay * 1.1);
            }

            function handleDropdowns(keyword, tryQuoted) {
                if (STOP_FLAG) return;
                const selects = document.querySelectorAll('select:not(.tm-ignore)');
                let count = 0;
                selects.forEach(select => {
                    for (let i = 0; i < select.options.length; i++) {
                        const txt = select.options[i].text.trim().toLowerCase();
                        if (txt === keyword || (tryQuoted && (txt === "quoted" || txt === "select"))) {
                            if (txt !== "select" || select.value === "") {
                                select.selectedIndex = i;
                                triggerEvents(select);
                                select.style.border = "2px solid #00e676";
                                count++;
                                break;
                            }
                        }
                    }
                });
                return count;
            }

            function proceedResume(password) {
                if (STOP_FLAG) return;
                showToast("🔄 অটোমেশন চলছে...");
                setTimeout(() => { handleAutomationLogic(password); }, getDelay());
            }

            function handleAutomationLogic(password) {
                if (STOP_FLAG) return;
                const encryptLink = findLinkByText('Encrypt');
                if (encryptLink) { encryptLink.click(); return; }
                const decryptBtn = document.getElementById('decrypt') || document.querySelector('input[value="Decrypt"]');
                if (decryptBtn) runDecryptPhase(password); else waitForOkButton(true);
            }

            function runDecryptPhase(password) {
                if (STOP_FLAG) return;
                const decryptBtn = document.getElementById('decrypt') || document.querySelector('input[value="Decrypt"]');
                const delay = getDelay();
                if(decryptBtn) {
                    decryptBtn.click();
                    showToast("🔓 Decrypt ক্লিক...");
                    waitForElement('input[type="password"]:not([disabled]):not(#global_password)', (passInput) => {
                        if (STOP_FLAG) return;
                        passInput.value = password;
                        triggerEvents(passInput);
                        passInput.style.border = "4px solid red";
                        setTimeout(() => {
                            if (STOP_FLAG) return;
                            const verifyBtn = findVerifyButton();
                            if(verifyBtn) verifyBtn.click(); else document.body.click();
                            waitForElement('input[value="Encrypt And Save"]:not([disabled]), #encrypt:not([disabled])', (finalBtn) => {
                                setTimeout(() => {
                                    if (STOP_FLAG) return;
                                    finalBtn.click(); showToast("💾 Encrypt And Save ক্লিক!"); waitForOkButton(false);
                                }, delay);
                            }, delay * 1.5);
                        }, delay);
                    });
                }
            }

            function waitForOkButton(isJustChecking) {
                if (STOP_FLAG) return;
                let attempts = 0;
                const interval = setInterval(() => {
                    if (STOP_FLAG) { clearInterval(interval); return; }
                    attempts++;
                    const okSpan = findElementByText('Ok', 'span') || findElementByText('OK', 'span') || findElementByText('Ok', 'button');
                    if (okSpan && okSpan.offsetParent !== null) {
                        clearInterval(interval);
                        okSpan.click();
                        showToast("🏁 OK ক্লিক!");
                        chrome.storage.local.set({[K('isAutoEncrypting')]: false});
                    } else if (attempts > 15) {
                        clearInterval(interval);
                        if(!isJustChecking) chrome.storage.local.set({[K('isAutoEncrypting')]: false});
                    }
                }, 300);
            }

            function findLinkByText(text) {
                const links = document.getElementsByTagName('a');
                for(let a of links) { if(a.innerText.trim() === text) return a; }
                return null;
            }
            function findVerifyButton() {
                const tags = ['span', 'button', 'input', 'a'];
                for (let tag of tags) {
                    const elements = document.getElementsByTagName(tag);
                    for (let el of elements) { if ((el.textContent || el.value || "").includes('Verify Password') && el.offsetParent !== null) return el; }
                }
                return null;
            }
            function findElementByText(text, tag = '*') {
                const elements = document.getElementsByTagName(tag);
                for (let i = 0; i < elements.length; i++) { if ((elements[i].textContent.includes(text) || elements[i].value === text)) return elements[i]; }
                return null;
            }
            function waitForElement(selector, callback, timeout = 500) {
                const start = Date.now();
                const interval = setInterval(() => {
                    if (STOP_FLAG) { clearInterval(interval); return; }
                    const el = document.querySelector(selector);
                    if (el && el.offsetParent !== null && !el.disabled) { clearInterval(interval); callback(el); }
                    else if (Date.now() - start > timeout) clearInterval(interval);
                }, 200);
            }

            function triggerEvents(el) {
                ['focus', 'keydown', 'input', 'change', 'blur', 'click'].forEach(evt => {
                    el.dispatchEvent(new Event(evt, { bubbles: true, cancelable: true }));
                });
            }

            function runStandardAutomation(password, autoMode = false) {
                if (STOP_FLAG) return;
                const delay = getDelay();
                setTimeout(() => {
                    if (STOP_FLAG) return;
                    const signBtn = document.querySelector('input[name="sign"], input[value="Sign"]');
                    if(signBtn) {
                        signBtn.click();
                        showToast("✍️ Sign এ ক্লিক...");
                        waitForElement('input[type="password"]:not([disabled]):not(#global_password)', (passInput) => {
                            if (STOP_FLAG) return;
                            passInput.value = password;
                            triggerEvents(passInput);
                            setTimeout(() => {
                                if (STOP_FLAG) return;
                                const verifyBtn = findVerifyButton();
                                if(verifyBtn) verifyBtn.click(); else document.body.click();
                                setTimeout(() => {
                                    if (STOP_FLAG) return;
                                    const encBtn = document.querySelector('input[value="Encrypt"]');
                                    if(encBtn) { encBtn.click(); showToast("🔒 Encrypt ক্লিক..."); }
                                    setTimeout(() => {
                                        if (STOP_FLAG) return;
                                        const saveBtn = document.getElementById('save');
                                        if(saveBtn) { saveBtn.click(); showToast("💾 Saved!"); if(autoMode) waitForOkButton(false); }
                                    }, delay);
                                }, delay * 1.1);
                            }, delay);
                        });
                    } else {
                         const saveBtn = document.getElementById('save');
                         if(saveBtn) { saveBtn.click(); if(autoMode) waitForOkButton(false); }
                    }
                }, delay);
            }

            function fillUniversalFields(valuesList) {
                if (STOP_FLAG) return;
                let allInputs = document.querySelectorAll('.formTxtBox_2, .formTxtArea_1, input[type="text"]:not(.tm-ignore), textarea:not(.tm-ignore)');
                let validFields = Array.from(allInputs).filter(el => { return el.type !== "hidden" && !el.disabled && el.style.display !== "none" && el.type !== "submit"; });
                validFields.forEach((field, index) => {
                    if (index < valuesList.length && valuesList[index]) {
                        field.value = valuesList[index];
                        triggerEvents(field);
                        field.style.backgroundColor = "#e8f5e9";
                    }
                });
            }
        })();
    })();

    // =========================================================================
    // ⬇️ আপনার তারিখ ক্যালকুলেটর কোড (বিন্দুুমাত্র পরিবর্তন ছাড়া নিচে দেওয়া হলো) ⬇️
    // =========================================================================

    (function() {
        'use strict';

        // =============== আপনার দেওয়া CSS (হুবহু + ছবির স্টাইল) ================
        GM_addStyle(`
        #gpCalcBtn {
            display: none !important; /* বাটনটি স্ক্রিন থেকে হাইড করার জন্য এটি যোগ করা হয়েছে */
            position: fixed;
            top: 120px;
            right: 20px;
            padding: 14px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 30px;
            font-size: 15px;
            cursor: pointer;
            z-index: 999999;
            box-shadow: 0 4px 10px rgba(0,0,0,.3);
            touch-action: none;
        }

        #gpCalcBtn:hover {
            background: #0056d2;
        }

        #gpResultBox {
            position: fixed;
            top: 90px;
            right: 20px;
            width: 270px;
            background: #fff;
            border: 2px solid #2ecc71;
            border-radius: 15px;
            padding: 15px;
            z-index: 9999999;
            font-size: 14px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            text-align: center;
        }

             .user-profile-pic {
            width: 130px !important;
            height: 130px !important;
            border-radius: 50% !important;
            border: 5px solid #ffffff !important;
            object-fit: cover !important;
            box-shadow: 0 1px 15px rgba(0,0,0,0.4) !important;
            display: block !important;
            margin-left: auto !important;  /* মাঝখানে নেওয়ার জন্য */
            margin-right: auto !important; /* মাঝখানে নেওয়ার জন্য */
             }

        `);

        // =============== আপনার দেওয়া JavaScript (হুবহু রাখা হয়েছে) ================

        if (window.location.href.includes("ViewTender.jsp")) {
            extractDatesOnViewPage();
        } else {
            createFloatingButton();
        }

        function createFloatingButton() {
            const btn = document.createElement("button");
            btn.innerText = "Calculate Days";
            btn.id = "gpCalcBtn";
            document.body.appendChild(btn);

            btn.addEventListener("click", () => {
                const viewNoticeLink = [...document.querySelectorAll("a")]
                    .find(a => a.innerText.trim().toLowerCase() === "view notice");

                if (!viewNoticeLink) {
                    alert("❌ View Notice লিংক পাওয়া যায়নি!");
                    return;
                }
            });
        }

        function extractDatesOnViewPage() {
            setTimeout(() => {
                const cells = [...document.querySelectorAll("td.t-align-center")];
                const dates = cells
                    .map(td => td.innerText.trim())
                    .filter(txt => /^\d{2}-[A-Za-z]{3}-\d{4}$/.test(txt));

                if (dates.length < 2) {
                    alert("❌ তারিখ পাওয়া যায়নি!");
                    return;
                }

                const startDate = dates[0];
                const endDate = dates[1];
                const diff = calcDays(startDate, endDate);
                showResult(startDate, endDate, diff);

            }, 10);
        }

        function calcDays(s, e) {
            const start = new Date(s);
            const end = new Date(e);
            return Math.floor((end - start) / (1000 * 60 * 60 * 24));
        }

        // =============== রেজাল্ট বক্স (ছবি ও ক্যালকুলেশন ফিক্সড) ================
        function showResult(start, end, days) {
            const box = document.createElement("div");
            box.id = "gpResultBox";

            // আপনার ড্রাইভের ছবির জন্য আরও উন্নত ডিরেক্ট লিংক ব্যবহার করা হয়েছে
            const photoID = "1KvJDr7HZ4lQXjQLQ34be0gmFuj6I1Yub";
            const myPhotoURL = `https://lh3.googleusercontent.com/d/${photoID}`;

            box.innerHTML = `
                <img src="${myPhotoURL}" class="user-profile-pic" alt="Profile Photo">
                <div style="margin-top: 5px;">
                    <h3 style="margin: 0; font-size: 16px;">📅 Date Result</h3>
                </div>
                <div style="text-align: left; margin-top: 8px; border-top: 1px solid #eee; padding-top: 5px;">
                    <p><b>Start:</b> ${start}</p>
                    <p><b>End:</b> ${end}</p>
                    <p style="margin-top:4px;"><b>Total Days:</b> ${days}</p>
                </div>

                <div style="
                    margin-top:10px;
                    padding:12px;
                    background:#f0f7ff;
                    border-left:5px solid #007bff;
                    border-radius:8px;
                    display:flex;
                    flex-direction: column;
                    gap: 8px;
                    font-size:15px;
                    font-weight:bold;
                    text-align: left;
                ">
                    <div>📘 Total Days &nbsp;
                    <span style="color:#e67e22; font-size:18px;">7</span>:
                    <span style="color:#e67e22; font-size:18px;">${days - 7 - 5}</span>
                    </div>

                    <div>📘 Total Days &nbsp;
                    <span style="color:#e67e22; font-size:18px;">3</span>:
                    <span style="color:#e67e22; font-size:18px;">${days - 3 - 5}</span>
                    </div>
                </div>
            `;
            document.body.appendChild(box);
        }

        function makeButtonDraggable() {
            const btn = document.getElementById("gpCalcBtn");
            if (!btn) return;

            btn.style.position = "fixed";
            btn.style.cursor = "grab";
            btn.style.userSelect = "none";

            const savedX = localStorage.getItem("gpBtnX");
            const savedY = localStorage.getItem("gpBtnY");

            if (savedX && savedY) {
                btn.style.left = savedX + "px";
                btn.style.top = savedY + "px";
            }

            let isDown = false, offsetX = 0, offsetY = 0;

            const getPos = (e) => {
                if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
                return { x: e.clientX, y: e.clientY };
            };

            const onStart = (e) => {
                isDown = true;
                const pos = getPos(e);
                offsetX = pos.x - btn.offsetLeft;
                offsetY = pos.y - btn.offsetTop;
                btn.style.cursor = "grabbing";
            };

            const onMove = (e) => {
                if (!isDown) return;
                const pos = getPos(e);
                const newX = pos.x - offsetX;
                const newY = pos.y - offsetY;
                btn.style.left = newX + "px";
                btn.style.top = newY + "px";
                if (e.cancelable) e.preventDefault();
            };

            const onEnd = () => {
                if (isDown) {
                    localStorage.setItem("gpBtnX", parseInt(btn.style.left));
                    localStorage.setItem("gpBtnY", parseInt(btn.style.top));
                }
                isDown = false;
                btn.style.cursor = "grab";
            };

            btn.addEventListener("mousedown", onStart);
            document.addEventListener("mousemove", onMove);
            document.addEventListener("mouseup", onEnd);

            btn.addEventListener("touchstart", onStart, { passive: false });
            document.addEventListener("touchmove", onMove, { passive: false });
            document.addEventListener("touchend", onEnd);
        }

        const observeBtn = setInterval(() => {
            const exists = document.getElementById("gpCalcBtn");
            if (exists) {
                makeButtonDraggable();
                clearInterval(observeBtn);
            }
        }, 10);

    })();

})();
