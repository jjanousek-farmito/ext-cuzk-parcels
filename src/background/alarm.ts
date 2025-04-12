import { config } from '@/storage';
import { get } from 'svelte/store';

export default async function createAlarm(alarmName: string, callback: (timestamp?: number) => void, options: any) {

    options = options || {
        periodInMinutes: get(config).autoSessionDelay / 60,
        delayInMinutes: .30,
    };
    console.log('[CRM_CUZK]: Alarm module loaded');

    const alarm = await chrome.alarms.get(alarmName);

    if (!alarm) {
        await chrome.alarms.create(alarmName, options);

        chrome.alarms.onAlarm.addListener(async (alarm) => {
            if (alarm.name === alarmName) {
                const alarmDelay = options.periodInMinutes;
                console.log('CUZK Login alarm triggered:', alarm);
                console.log(`Next alarm will trigger in ${alarmDelay} minutes at`, new Date(Date.now() + alarmDelay * 60 * 1000));

                callback(Date.now());
            }
        });

        chrome.runtime.onSuspend.addListener(() => {
            console.log('Alarm suspended');
            chrome.alarms.clear(alarmName);
        });
        console.log('Alarm created at ', new Date());
    } else {
        console.log('Alarm already exists:', alarm);
        console.log('Next alarm will trigger in', (alarm.scheduledTime - Date.now()) / 1000, 'seconds at', new Date(alarm.scheduledTime));
    }

    return alarm;
}