import { config } from '@/storage';
import { closeTabAfterDelay, openCuzk } from './utils';
import { get } from 'svelte/store';

export default async function () {
    console.log('[CRM_CUZK]: Alarm module loaded');

    const alarmEnabled = true; // Set to true to enable the alarm


    if (alarmEnabled) {
        const alarm = await chrome.alarms.get("cuzk-login-alarm");

        if (!alarm) {
            await chrome.alarms.create('cuzk-login-alarm', {
                delayInMinutes: .5,
                periodInMinutes: 1,

            });
        }
        console.log('Alarm created at ', new Date());

        console.log('Alarm will trigger in 30 seconds at', new Date(Date.now() + 30 * 1000));
    }

    chrome.alarms.onAlarm.addListener(async (alarm) => {
        const alarmDelay = get(config).autoSessionDelay;
        if (alarm.name === 'cuzk-login-alarm') {
            console.log('CUZK Login alarm triggered:', alarm);
            console.log(`Next alarm will trigger in ${alarmDelay / 60} minutes at`, new Date(Date.now() + alarmDelay * 1000));

            // Open CUZK in a new tab
            openCuzk(false, closeTabAfterDelay(2000))
        }
    });

    chrome.runtime.onSuspend.addListener(() => {
        console.log('Alarm suspended');
    });

}