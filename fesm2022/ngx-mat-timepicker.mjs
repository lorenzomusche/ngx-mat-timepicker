import { coerceBooleanProperty } from '@angular/cdk/coercion';
import * as i0 from '@angular/core';
import { InjectionToken, Injectable, Inject, Directive, Input, HostListener, Pipe, EventEmitter, ElementRef, Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, Output, Optional, HostBinding, ContentChild, NgModule } from '@angular/core';
import * as i1$1 from '@angular/cdk/overlay';
import { CdkOverlayOrigin, CdkConnectedOverlay, OverlayModule } from '@angular/cdk/overlay';
import { DateTime, Info } from 'ts-luxon';
import { NgStyle, NgFor, NgIf, NgTemplateOutlet, NgClass, SlicePipe, DOCUMENT, AsyncPipe, NgSwitch, NgSwitchCase, CommonModule } from '@angular/common';
import * as i1$2 from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import * as i1 from '@angular/material/button';
import { MatButtonModule, MAT_FAB_DEFAULT_OPTIONS } from '@angular/material/button';
import * as i6 from '@angular/material/toolbar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BehaviorSubject, Subject, takeUntil as takeUntil$1 } from 'rxjs';
import { shareReplay, takeUntil, tap, map, distinctUntilChanged } from 'rxjs/operators';
import { trigger, transition, style, animate, sequence } from '@angular/animations';
import * as i4 from '@angular/forms';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as i5 from '@angular/cdk/a11y';
import { A11yModule } from '@angular/cdk/a11y';
import * as i4$1 from '@angular/material/select';
import { MatSelectModule } from '@angular/material/select';
import * as i5$1 from '@angular/material/core';
import { MatOptionModule } from '@angular/material/core';
import * as i2 from '@angular/material/form-field';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import * as i7 from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import * as i3 from '@angular/material/input';
import { MatInputModule } from '@angular/material/input';
import { PortalModule } from '@angular/cdk/portal';

var NgxMatTimepickerFormat;
(function (NgxMatTimepickerFormat) {
    NgxMatTimepickerFormat["TWELVE"] = "hh:mm a";
    NgxMatTimepickerFormat["TWELVE_SHORT"] = "h:m a";
    NgxMatTimepickerFormat["TWENTY_FOUR"] = "HH:mm";
    NgxMatTimepickerFormat["TWENTY_FOUR_SHORT"] = "H:m";
})(NgxMatTimepickerFormat || (NgxMatTimepickerFormat = {}));

var NgxMatTimepickerPeriods;
(function (NgxMatTimepickerPeriods) {
    NgxMatTimepickerPeriods["AM"] = "AM";
    NgxMatTimepickerPeriods["PM"] = "PM";
})(NgxMatTimepickerPeriods || (NgxMatTimepickerPeriods = {}));

// @dynamic
class NgxMatTimepickerAdapter {
    static { this.defaultFormat = 12; }
    static { this.defaultLocale = "en-US"; }
    static { this.defaultNumberingSystem = "latn"; }
    /***
     *  Format hour according to time format (12 or 24)
     */
    static formatHour(currentHour, format, period) {
        if (this.isTwentyFour(format)) {
            return currentHour;
        }
        const hour = period === NgxMatTimepickerPeriods.AM ? currentHour : currentHour + 12;
        if (period === NgxMatTimepickerPeriods.AM && hour === 12) {
            return 0;
        }
        else if (period === NgxMatTimepickerPeriods.PM && hour === 24) {
            return 12;
        }
        return hour;
    }
    static formatTime(time, opts) {
        if (!time) {
            return "Invalid Time";
        }
        const parsedTime = this.parseTime(time, opts).setLocale(this.defaultLocale);
        if (!parsedTime.isValid) {
            return "Invalid time";
        }
        const isTwelve = !this.isTwentyFour(opts.format);
        if (isTwelve) {
            return parsedTime.toLocaleString({
                ...DateTime.TIME_SIMPLE,
                hour12: isTwelve
            }).replace(/\u200E/g, "");
        }
        return parsedTime.toISOTime({
            includeOffset: false,
            suppressMilliseconds: true,
            suppressSeconds: true
        }).replace(/\u200E/g, "");
    }
    static fromDateTimeToString(time, format) {
        return time.reconfigure({
            numberingSystem: this.defaultNumberingSystem,
            locale: this.defaultLocale
        }).toFormat(this.isTwentyFour(format) ? NgxMatTimepickerFormat.TWENTY_FOUR : NgxMatTimepickerFormat.TWELVE);
    }
    static isBetween(time, before, after, unit = "minutes") {
        const innerUnit = unit === "hours" ? unit : void 0;
        return this.isSameOrBefore(time, after, innerUnit) && this.isSameOrAfter(time, before, innerUnit);
    }
    static isSameOrAfter(time, compareWith, unit = "minutes") {
        if (unit === "hours") {
            return time.hour >= compareWith.hour;
        }
        return time.hasSame(compareWith, unit) || time.valueOf() > compareWith.valueOf();
    }
    static isSameOrBefore(time, compareWith, unit = "minutes") {
        if (unit === "hours") {
            return time.hour <= compareWith.hour;
        }
        return time.hasSame(compareWith, unit) || time.valueOf() <= compareWith.valueOf();
    }
    static isTimeAvailable(time, min, max, granularity, minutesGap, format) {
        if (!time) {
            return void 0;
        }
        const convertedTime = this.parseTime(time, { format });
        const minutes = convertedTime.minute;
        if (minutesGap && minutes === minutes && minutes % minutesGap !== 0) {
            throw new Error(`Your minutes - ${minutes} doesn\'t match your minutesGap - ${minutesGap}`);
        }
        const isAfter = (min && !max)
            && this.isSameOrAfter(convertedTime, min, granularity);
        const isBefore = (max && !min)
            && this.isSameOrBefore(convertedTime, max, granularity);
        const between = (min && max)
            && this.isBetween(convertedTime, min, max, granularity);
        const isAvailable = !min && !max;
        return isAfter || isBefore || between || isAvailable;
    }
    static isTwentyFour(format) {
        return format === 24;
    }
    static parseTime(time, opts) {
        const localeOpts = this._getLocaleOptionsByTime(time, opts);
        let timeMask = NgxMatTimepickerFormat.TWENTY_FOUR_SHORT;
        // If there's a space, means we have the meridiem. Way faster than splitting text
        // if (~time.indexOf(" ")) {
        // 09/02/2023 it seems that sometimes the space from the formatter is a nnbsp (Chromium >= 110)
        // which causes the indexOf(" ") to fail: charCode 32, while nbsp is 8239
        if (time.match(/\s/g)) {
            /*
             * We translate the meridiem in simple AM or PM letters (instead of A.M.)
             * because even if we set the locale with NgxMatTimepickerModule.setLocale
             * the default (en-US) will always be used here
             */
            time = time.replace(/\.\s*/g, "");
            timeMask = NgxMatTimepickerFormat.TWELVE_SHORT;
        }
        return DateTime.fromFormat(time.replace(/\s+/g, " "), timeMask, {
            numberingSystem: localeOpts.numberingSystem,
            locale: localeOpts.locale
        });
    }
    static toLocaleTimeString(time, opts = {}) {
        const { format = this.defaultFormat, locale = this.defaultLocale } = opts;
        let hourCycle = "h12";
        let timeMask = NgxMatTimepickerFormat.TWELVE_SHORT;
        if (this.isTwentyFour(format)) {
            hourCycle = "h23";
            timeMask = NgxMatTimepickerFormat.TWENTY_FOUR_SHORT;
        }
        return DateTime.fromFormat(time, timeMask).reconfigure({
            locale,
            numberingSystem: opts.numberingSystem,
            defaultToEN: opts.defaultToEN,
            outputCalendar: opts.outputCalendar
        }).toLocaleString({
            ...DateTime.TIME_SIMPLE,
            hourCycle
        });
    }
    /**
     *
     * @param time
     * @param opts
     * @private
     */
    static _getLocaleOptionsByTime(time, opts) {
        const { numberingSystem, locale } = DateTime.now().reconfigure({
            locale: opts.locale,
            numberingSystem: opts.numberingSystem,
            outputCalendar: opts.outputCalendar,
            defaultToEN: opts.defaultToEN
        }).resolvedLocaleOptions();
        return isNaN(parseInt(time, 10)) ? {
            numberingSystem: numberingSystem,
            locale
        } : {
            numberingSystem: this.defaultNumberingSystem,
            locale: this.defaultLocale
        };
    }
}

var NgxMatTimepickerUnits;
(function (NgxMatTimepickerUnits) {
    NgxMatTimepickerUnits[NgxMatTimepickerUnits["HOUR"] = 0] = "HOUR";
    NgxMatTimepickerUnits[NgxMatTimepickerUnits["MINUTE"] = 1] = "MINUTE";
})(NgxMatTimepickerUnits || (NgxMatTimepickerUnits = {}));

const NGX_MAT_TIMEPICKER_CONFIG = new InjectionToken("NGX_MAT_TIMEPICKER_CONFIG");
function provideNgxMatTimepickerOptions(config) {
    return [
        { provide: NGX_MAT_TIMEPICKER_CONFIG, useValue: config },
    ];
}

const DEFAULT_HOUR = {
    time: 12,
    angle: 360
};
const DEFAULT_MINUTE = {
    time: 0,
    angle: 360
};
class NgxMatTimepickerService {
    constructor() {
        this._hour$ = new BehaviorSubject(DEFAULT_HOUR);
        this._minute$ = new BehaviorSubject(DEFAULT_MINUTE);
        this._period$ = new BehaviorSubject(NgxMatTimepickerPeriods.AM);
    }
    set hour(hour) {
        this._hour$.next(hour);
    }
    set minute(minute) {
        this._minute$.next(minute);
    }
    set period(period) {
        const isPeriodValid = (period === NgxMatTimepickerPeriods.AM) || (period === NgxMatTimepickerPeriods.PM);
        if (isPeriodValid) {
            this._period$.next(period);
        }
    }
    get selectedHour() {
        return this._hour$.asObservable();
    }
    get selectedMinute() {
        return this._minute$.asObservable();
    }
    get selectedPeriod() {
        return this._period$.asObservable();
    }
    getFullTime(format) {
        const selectedHour = this._hour$.getValue().time;
        const selectedMinute = this._minute$.getValue().time;
        const hour = selectedHour != null ? selectedHour : DEFAULT_HOUR.time;
        const minute = selectedMinute != null ? selectedMinute : DEFAULT_MINUTE.time;
        const period = format === 12 ? this._period$.getValue() : "";
        const time = `${hour}:${minute} ${period}`.trim();
        return NgxMatTimepickerAdapter.formatTime(time, { format });
    }
    setDefaultTimeIfAvailable(time, min, max, format, minutesGap) {
        time || this._resetTime();
        /* Workaround to double error message*/
        try {
            if (NgxMatTimepickerAdapter.isTimeAvailable(time, min, max, "minutes", minutesGap)) {
                this._setDefaultTime(time, format);
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    _resetTime() {
        this.hour = { ...DEFAULT_HOUR };
        this.minute = { ...DEFAULT_MINUTE };
        this.period = NgxMatTimepickerPeriods.AM;
    }
    _setDefaultTime(time, format) {
        const defaultDto = NgxMatTimepickerAdapter.parseTime(time, { format });
        if (defaultDto.isValid) {
            const period = time.substring(time.length - 2).toUpperCase();
            const hour = defaultDto.hour;
            this.hour = { ...DEFAULT_HOUR, time: formatHourByPeriod(hour, period) };
            this.minute = { ...DEFAULT_MINUTE, time: defaultDto.minute };
            this.period = period;
        }
        else {
            this._resetTime();
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerService, providedIn: "root" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: "root"
                }]
        }] });
/***
 *  Format hour in 24hours format to meridian (AM or PM) format
 */
function formatHourByPeriod(hour, period) {
    switch (period) {
        case NgxMatTimepickerPeriods.AM:
            return hour === 0 ? 12 : hour;
        case NgxMatTimepickerPeriods.PM:
            return hour === 12 ? 12 : hour - 12;
        default:
            return hour;
    }
}

class NgxMatTimepickerEventService {
    get backdropClick() {
        return this._backdropClick$.asObservable().pipe(shareReplay({ bufferSize: 1, refCount: true }));
    }
    get keydownEvent() {
        return this._keydownEvent$.asObservable().pipe(shareReplay({ bufferSize: 1, refCount: true }));
    }
    constructor() {
        this._backdropClick$ = new Subject();
        this._keydownEvent$ = new Subject();
    }
    dispatchEvent(event) {
        switch (event.type) {
            case "click":
                this._backdropClick$.next(event);
                break;
            case "keydown":
                this._keydownEvent$.next(event);
                break;
            default:
                throw new Error("no such event type");
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerEventService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerEventService, providedIn: "root" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerEventService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: "root"
                }]
        }], ctorParameters: () => [] });

const NGX_MAT_TIMEPICKER_LOCALE = new InjectionToken("TimeLocale", {
    providedIn: "root",
    factory: () => NgxMatTimepickerAdapter.defaultLocale
});

class NgxMatTimepickerLocaleService {
    get locale() {
        return this._locale;
    }
    constructor(initialLocale) {
        this._locale = initialLocale;
    }
    updateLocale(newValue) {
        this._locale = newValue || this._initialLocale;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerLocaleService, deps: [{ token: NGX_MAT_TIMEPICKER_LOCALE }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerLocaleService, providedIn: "root" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerLocaleService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: "root"
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [NGX_MAT_TIMEPICKER_LOCALE]
                }] }] });

class NgxMatTimepickerBaseDirective {
    set color(newValue) {
        this._color = newValue;
    }
    get color() {
        return this._color;
    }
    get defaultTime() {
        return this._defaultTime;
    }
    set defaultTime(time) {
        this._defaultTime = time;
        this._setDefaultTime(time);
    }
    get _locale() {
        return this._timepickerLocaleSrv.locale;
    }
    constructor(_timepickerSrv, _eventSrv, _timepickerLocaleSrv, data) {
        this._timepickerSrv = _timepickerSrv;
        this._eventSrv = _eventSrv;
        this._timepickerLocaleSrv = _timepickerLocaleSrv;
        this.data = data;
        this.activeTimeUnit = NgxMatTimepickerUnits.HOUR;
        this.timeUnit = NgxMatTimepickerUnits;
        this._color = "primary";
        this._subsCtrl$ = new Subject();
        this.color = data.color;
        this.defaultTime = data.defaultTime;
    }
    changePeriod(period) {
        this._timepickerSrv.period = period;
        this._onTimeChange();
    }
    changeTimeUnit(unit) {
        this.activeTimeUnit = unit;
    }
    close() {
        this.data.timepickerBaseRef.close();
    }
    ngOnDestroy() {
        this._subsCtrl$.next();
        this._subsCtrl$.complete();
    }
    ngOnInit() {
        this._defineTime();
        this.selectedHour = this._timepickerSrv.selectedHour
            .pipe(shareReplay({ bufferSize: 1, refCount: true }));
        this.selectedMinute = this._timepickerSrv.selectedMinute
            .pipe(shareReplay({ bufferSize: 1, refCount: true }));
        this.selectedPeriod = this._timepickerSrv.selectedPeriod
            .pipe(shareReplay({ bufferSize: 1, refCount: true }));
        this.data.timepickerBaseRef.timeUpdated.pipe(takeUntil(this._subsCtrl$))
            .subscribe({
            next: (v) => {
                v && this._setDefaultTime(v);
            }
        });
    }
    onHourChange(hour) {
        this._timepickerSrv.hour = hour;
        this._onTimeChange();
    }
    onHourSelected(hour) {
        if (!this.data.hoursOnly) {
            this.changeTimeUnit(NgxMatTimepickerUnits.MINUTE);
        }
        this.data.timepickerBaseRef.hourSelected.next(hour);
    }
    onKeydown(e) {
        this._eventSrv.dispatchEvent(e);
        e.stopPropagation();
    }
    onMinuteChange(minute) {
        this._timepickerSrv.minute = minute;
        this._onTimeChange();
    }
    setTime() {
        this.data.timepickerBaseRef.timeSet.emit(this._timepickerSrv.getFullTime(this.data.format));
        this.close();
    }
    _defineTime() {
        const minTime = this.data.minTime;
        if (minTime && (!this.data.time && !this.data.defaultTime)) {
            const time = NgxMatTimepickerAdapter.fromDateTimeToString(minTime, this.data.format);
            this._setDefaultTime(time);
        }
    }
    _onTimeChange() {
        const time = NgxMatTimepickerAdapter.toLocaleTimeString(this._timepickerSrv.getFullTime(this.data.format), {
            locale: this._locale,
            format: this.data.format
        });
        this.data.timepickerBaseRef.timeChanged.emit(time);
    }
    _setDefaultTime(time) {
        this._timepickerSrv.setDefaultTimeIfAvailable(time, this.data.minTime, this.data.maxTime, this.data.format, this.data.minutesGap);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerBaseDirective, deps: [{ token: NgxMatTimepickerService }, { token: NgxMatTimepickerEventService }, { token: NgxMatTimepickerLocaleService }, { token: NGX_MAT_TIMEPICKER_CONFIG }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerBaseDirective, isStandalone: true, selector: "[ngxMatTimepickerBase]", inputs: { color: "color", defaultTime: "defaultTime" }, host: { listeners: { "keydown": "onKeydown($event)" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerBaseDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: "[ngxMatTimepickerBase]",
                    standalone: true
                }]
        }], ctorParameters: () => [{ type: NgxMatTimepickerService }, { type: NgxMatTimepickerEventService }, { type: NgxMatTimepickerLocaleService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [NGX_MAT_TIMEPICKER_CONFIG]
                }] }], propDecorators: { color: [{
                type: Input
            }], defaultTime: [{
                type: Input
            }], onKeydown: [{
                type: HostListener,
                args: ["keydown", ["$event"]]
            }] } });

// @dynamic
class NgxMatTimepickerUtils {
    static get DEFAULT_MINUTES_GAP() {
        return 5;
    }
    static disableHours(hours, config) {
        if (config.min || config.max) {
            return hours.map(value => {
                const hour = NgxMatTimepickerAdapter.isTwentyFour(config.format)
                    ? value.time
                    : NgxMatTimepickerAdapter.formatHour(value.time, config.format, config.period);
                const currentTime = DateTime.fromObject({ hour }).toFormat(NgxMatTimepickerFormat.TWELVE);
                return {
                    ...value,
                    disabled: !NgxMatTimepickerAdapter.isTimeAvailable(currentTime, config.min, config.max, "hours")
                };
            });
        }
        return hours;
    }
    static disableMinutes(minutes, selectedHour, config) {
        if (config.min || config.max) {
            const hour = NgxMatTimepickerAdapter.formatHour(selectedHour, config.format, config.period);
            let currentTime = DateTime.fromObject({
                hour,
                minute: 0
            });
            return minutes.map(value => {
                currentTime = currentTime.set({ minute: value.time });
                return {
                    ...value,
                    disabled: !NgxMatTimepickerAdapter.isTimeAvailable(currentTime.toFormat(NgxMatTimepickerFormat.TWELVE), config.min, config.max, "minutes")
                };
            });
        }
        return minutes;
    }
    static getHours(format) {
        return Array(format).fill(1).map((v, i) => {
            const angleStep = 30;
            const time = v + i;
            const angle = angleStep * time;
            return { time: time === 24 ? 0 : time, angle };
        });
    }
    static getMinutes(gap = 1) {
        const minutesCount = 60;
        const angleStep = 360 / minutesCount;
        const minutes = [];
        for (let i = 0; i < minutesCount; i++) {
            const angle = angleStep * i;
            if (i % gap === 0) {
                minutes.push({ time: i, angle: angle !== 0 ? angle : 360 });
            }
        }
        return minutes;
    }
    static isDigit(e) {
        // Allow: backspace, delete, tab, escape, enter
        if ([46, 8, 9, 27, 13].some(n => n === e.keyCode) ||
            // Allow: Ctrl/cmd+A
            (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
            // Allow: Ctrl/cmd+C
            (e.keyCode === 67 && (e.ctrlKey === true || e.metaKey === true)) ||
            // Allow: Ctrl/cmd+X
            (e.keyCode === 88 && (e.ctrlKey === true || e.metaKey === true)) ||
            // Allow: home, end, left, right, up, down
            (e.keyCode >= 35 && e.keyCode <= 40)) {
            return true;
        }
        return !((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105));
    }
}

var NgxMatTimepickerMeasure;
(function (NgxMatTimepickerMeasure) {
    NgxMatTimepickerMeasure["hour"] = "hour";
    NgxMatTimepickerMeasure["minute"] = "minute";
})(NgxMatTimepickerMeasure || (NgxMatTimepickerMeasure = {}));

class NgxMatTimepickerTimeLocalizerPipe {
    get _locale() {
        return this._timepickerLocaleSrv.locale;
    }
    constructor(_timepickerLocaleSrv) {
        this._timepickerLocaleSrv = _timepickerLocaleSrv;
    }
    transform(time, timeUnit, isKeyboardEnabled = false) {
        if (time == null || time === "") {
            return "";
        }
        switch (timeUnit) {
            case NgxMatTimepickerUnits.HOUR: {
                const format = (time === 0 || isKeyboardEnabled) ? "HH" : "H";
                return this._formatTime(NgxMatTimepickerMeasure.hour, time, format);
            }
            case NgxMatTimepickerUnits.MINUTE:
                return this._formatTime(NgxMatTimepickerMeasure.minute, time, "mm");
            default:
                throw new Error(`There is no Time Unit with type ${timeUnit}`);
        }
    }
    _formatTime(timeMeasure, time, format) {
        try {
            return DateTime.fromObject({ [timeMeasure]: +time }).setLocale(this._locale).toFormat(format);
        }
        catch {
            throw new Error(`Cannot format provided time - ${time} to locale - ${this._locale}`);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerTimeLocalizerPipe, deps: [{ token: NgxMatTimepickerLocaleService }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerTimeLocalizerPipe, isStandalone: true, name: "timeLocalizer" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerTimeLocalizerPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: "timeLocalizer",
                    standalone: true
                }]
        }], ctorParameters: () => [{ type: NgxMatTimepickerLocaleService }] });

class NgxMatTimepickerMinutesFormatterPipe {
    transform(minute, gap = NgxMatTimepickerUtils.DEFAULT_MINUTES_GAP) {
        if (!minute) {
            return minute;
        }
        return minute % gap === 0 ? minute : "";
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerMinutesFormatterPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerMinutesFormatterPipe, isStandalone: true, name: "minutesFormatter" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerMinutesFormatterPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: "minutesFormatter",
                    standalone: true
                }]
        }] });

class NgxMatTimepickerActiveMinutePipe {
    transform(minute, currentMinute, gap, isClockFaceDisabled) {
        if (minute == null || isClockFaceDisabled) {
            return false;
        }
        return ((currentMinute === minute) && (minute % (gap || NgxMatTimepickerUtils.DEFAULT_MINUTES_GAP) === 0));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerActiveMinutePipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerActiveMinutePipe, isStandalone: true, name: "activeMinute" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerActiveMinutePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: "activeMinute",
                    standalone: true
                }]
        }] });

class NgxMatTimepickerActiveHourPipe {
    transform(hour, currentHour, isClockFaceDisabled) {
        if (hour == null || isClockFaceDisabled) {
            return false;
        }
        return hour === currentHour;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerActiveHourPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerActiveHourPipe, isStandalone: true, name: "activeHour" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerActiveHourPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: "activeHour",
                    standalone: true
                }]
        }] });

function roundAngle(angle, step) {
    return Math.round(angle / step) * step;
}
function countAngleByCords(x0, y0, x, y, currentAngle) {
    if (y > y0 && x >= x0) { // II quarter
        return 180 - currentAngle;
    }
    else if (y > y0 && x < x0) { // III quarter
        return 180 + currentAngle;
    }
    else if (y < y0 && x < x0) { // IV quarter
        return 360 - currentAngle;
    }
    else { // I quarter
        return currentAngle;
    }
}
const CLOCK_HAND_STYLES = {
    small: {
        height: "75px",
        top: "calc(50% - 75px)"
    },
    large: {
        height: "103px",
        top: "calc(50% - 103px)"
    }
};
class NgxMatTimepickerFaceComponent {
    constructor() {
        this.color = "primary";
        this.innerClockFaceSize = 85;
        this.timeChange = new EventEmitter();
        this.timeSelected = new EventEmitter();
        this.timeUnit = NgxMatTimepickerUnits;
    }
    ngAfterViewInit() {
        this._setClockHandPosition();
        this._addTouchEvents();
    }
    ngOnChanges(changes) {
        // tslint:disable-next-line:no-string-literal
        const faceTimeChanges = changes["faceTime"];
        // tslint:disable-next-line:no-string-literal
        const selectedTimeChanges = changes["selectedTime"];
        if ((faceTimeChanges && faceTimeChanges.currentValue)
            && (selectedTimeChanges && selectedTimeChanges.currentValue)) {
            /* Set time according to pass an input value */
            this.selectedTime = this.faceTime.find(time => time.time === this.selectedTime.time);
        }
        if (selectedTimeChanges && selectedTimeChanges.currentValue) {
            this._setClockHandPosition();
        }
        if (faceTimeChanges && faceTimeChanges.currentValue) {
            // To avoid an error ExpressionChangedAfterItHasBeenCheckedError
            setTimeout(() => this._selectAvailableTime());
        }
    }
    ngOnDestroy() {
        this._removeTouchEvents();
    }
    onMousedown(e) {
        e.preventDefault();
        this._isStarted = true;
    }
    onMouseup(e) {
        e.preventDefault();
        this._isStarted = false;
    }
    selectTime(e) {
        if (!this._isStarted && (e instanceof MouseEvent && e.type !== "click")) {
            return;
        }
        const clockFaceCords = this.clockFace.nativeElement.getBoundingClientRect();
        /* Get x0 and y0 of the circle */
        const centerX = clockFaceCords.left + clockFaceCords.width / 2;
        const centerY = clockFaceCords.top + clockFaceCords.height / 2;
        /* Counting the arctangent and convert it to from radian to deg */
        const arctangent = Math.atan(Math.abs(e.clientX - centerX) / Math.abs(e.clientY - centerY)) * 180 / Math.PI;
        /* Get angle according to quadrant */
        const circleAngle = countAngleByCords(centerX, centerY, e.clientX, e.clientY, arctangent);
        /* Check if selected time from the inner clock face (24 hours format only) */
        const isInnerClockChosen = this.format && this._isInnerClockFace(centerX, centerY, e.clientX, e.clientY);
        /* Round angle according to angle step */
        const angleStep = this.unit === NgxMatTimepickerUnits.MINUTE ? (6 * (this.minutesGap || 1)) : 30;
        const roundedAngle = roundAngle(circleAngle, angleStep);
        const angle = (roundedAngle || 360) + (isInnerClockChosen ? 360 : 0);
        const selectedTime = this.faceTime.find(val => val.angle === angle);
        if (selectedTime && !selectedTime.disabled) {
            this.timeChange.next(selectedTime);
            /* To let know whether user ended interaction with clock face */
            if (!this._isStarted) {
                this.timeSelected.next(selectedTime.time);
            }
        }
    }
    trackByTime(_item_, time) {
        return time.time;
    }
    _addTouchEvents() {
        this._touchStartHandler = this.onMousedown.bind(this);
        this._touchEndHandler = this.onMouseup.bind(this);
        this.clockFace.nativeElement.addEventListener("touchstart", this._touchStartHandler);
        this.clockFace.nativeElement.addEventListener("touchend", this._touchEndHandler);
    }
    _decreaseClockHand() {
        this.clockHand.nativeElement.style.height = CLOCK_HAND_STYLES.small.height;
        this.clockHand.nativeElement.style.top = CLOCK_HAND_STYLES.small.top;
    }
    _increaseClockHand() {
        this.clockHand.nativeElement.style.height = CLOCK_HAND_STYLES.large.height;
        this.clockHand.nativeElement.style.top = CLOCK_HAND_STYLES.large.top;
    }
    _isInnerClockFace(x0, y0, x, y) {
        /* Detect whether time from the inner clock face or not (24 format only) */
        return Math.sqrt(Math.pow(x - x0, 2) + Math.pow(y - y0, 2)) < this.innerClockFaceSize;
    }
    _removeTouchEvents() {
        this.clockFace.nativeElement.removeEventListener("touchstart", this._touchStartHandler);
        this.clockFace.nativeElement.removeEventListener("touchend", this._touchEndHandler);
    }
    _selectAvailableTime() {
        const currentTime = this.faceTime.find(time => this.selectedTime.time === time.time);
        this.isClockFaceDisabled = this.faceTime.every(time => time.disabled);
        if ((currentTime && currentTime.disabled) && !this.isClockFaceDisabled) {
            const availableTime = this.faceTime.find(time => !time.disabled);
            this.timeChange.next(availableTime);
        }
    }
    _setClockHandPosition() {
        if (NgxMatTimepickerAdapter.isTwentyFour(this.format)) {
            if (this.selectedTime.time > 12 || this.selectedTime.time === 0) {
                this._decreaseClockHand();
            }
            else {
                this._increaseClockHand();
            }
        }
        if (this.selectedTime) {
            this.clockHand.nativeElement.style.transform = `rotate(${this.selectedTime.angle}deg)`;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerFaceComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerFaceComponent, isStandalone: true, selector: "ngx-mat-timepicker-face", inputs: { color: "color", dottedMinutesInGap: "dottedMinutesInGap", faceTime: "faceTime", format: "format", minutesGap: "minutesGap", selectedTime: "selectedTime", unit: "unit" }, outputs: { timeChange: "timeChange", timeSelected: "timeSelected" }, host: { listeners: { "mousedown": "onMousedown($event)", "mouseup": "onMouseup($event)", "click": "selectTime($event)", "touchmove": "selectTime($event.changedTouches[0])", "touchend": "selectTime($event.changedTouches[0])", "mousemove": "selectTime($event)" } }, viewQueries: [{ propertyName: "clockFace", first: true, predicate: ["clockFace"], descendants: true, static: true }, { propertyName: "clockHand", first: true, predicate: ["clockHand"], descendants: true, read: ElementRef, static: true }], usesOnChanges: true, ngImport: i0, template: "<!-- DEFAULT TEMPLATES - START -->\n<ng-template #hourButton\n             let-time>\n    <button mat-mini-fab\n            disableRipple\n            class=\"mat-elevation-z0\"\n            [color]=\"(time.time | activeHour: selectedTime?.time : isClockFaceDisabled) ? color : undefined\"\n            [ngStyle]=\"{'transform': 'rotateZ(-'+ time.angle +'deg)'}\"\n            [disabled]=\"time.disabled\">\n        {{time.time | timeLocalizer: timeUnit.HOUR}}\n    </button>\n</ng-template>\n<ng-template #minutesFace>\n    <div class=\"clock-face__container\">\n        <div class=\"clock-face__number clock-face__number--outer\"\n             [ngStyle]=\"{'transform': 'rotateZ('+ time.angle +'deg)'}\"\n             *ngFor=\"let time of faceTime; trackBy: trackByTime\">\n\t\t\t<input #current\n\t\t\t\t   type=\"hidden\"\n\t\t\t\t   [value]=\"time.time | minutesFormatter: minutesGap | timeLocalizer: timeUnit.MINUTE\" />\n            <button mat-mini-fab\n                    disableRipple\n                    class=\"mat-elevation-z0\"\n\t\t\t\t\t[class.dot]=\"dottedMinutesInGap && current.value === '' && !(time.time | activeMinute: selectedTime?.time:1:isClockFaceDisabled)\"\n                    [color]=\"(time.time | activeMinute: selectedTime?.time:minutesGap:isClockFaceDisabled) ? color : undefined\"\n                    [ngStyle]=\"{'transform': 'rotateZ(-'+ time.angle +'deg)'}\"\n                    [disabled]=\"time.disabled\">\n                {{current.value}}\n            </button>\n        </div>\n    </div>\n</ng-template>\n<!-- DEFAULT TEMPLATES - END -->\n<div class=\"clock-face\"\n     #clockFace>\n    <div *ngIf=\"unit !== timeUnit.MINUTE;else minutesFace\"\n         class=\"clock-face__container\">\n        <div class=\"clock-face__number clock-face__number--outer\"\n             [ngStyle]=\"{'transform': 'rotateZ('+ time.angle +'deg)'}\"\n             *ngFor=\"let time of faceTime | slice: 0 : 12; trackBy: trackByTime\">\n            <ng-content *ngTemplateOutlet=\"hourButton; context: {$implicit: time}\"></ng-content>\n        </div>\n        <div class=\"clock-face__inner\"\n             *ngIf=\"faceTime.length > 12\">\n            <div class=\"clock-face__number clock-face__number--inner\"\n                 [style.top]=\"'calc(50% - ' + innerClockFaceSize + 'px)'\"\n                 [ngStyle]=\"{'transform': 'rotateZ('+ time.angle +'deg)'}\"\n                 [style.height.px]=\"innerClockFaceSize\"\n                 *ngFor=\"let time of faceTime | slice: 12 : 24; trackBy: trackByTime\">\n                <ng-content *ngTemplateOutlet=\"hourButton; context: {$implicit: time}\"></ng-content>\n            </div>\n        </div>\n    </div>\n    <mat-toolbar class=\"clock-face__clock-hand\"\n                 [color]=\"color\"\n                 [ngClass]=\"{'clock-face__clock-hand_minute': unit === timeUnit.MINUTE}\"\n                 #clockHand\n                 [hidden]=\"isClockFaceDisabled\">\n        <button mat-mini-fab\n                *ngIf=\"unit === timeUnit.MINUTE\"\n                [color]=\"color\">\n            <span class=\"clock-face__clock-hand_minute_dot\"></span>\n        </button>\n    </mat-toolbar>\n    <mat-toolbar class=\"clock-face__center\"\n                 [color]=\"color\"></mat-toolbar>\n</div>\n", styles: ["ngx-mat-timepicker-face [mat-mini-fab].mat-unthemed{--mdc-fab-small-container-color: transparent;--mat-fab-small-disabled-state-container-color: transparent;--mat-fab-hover-state-layer-opacity: 0;box-shadow:none}ngx-mat-timepicker-face [mat-mini-fab].mat-unthemed .mat-mdc-button-persistent-ripple{display:none}ngx-mat-timepicker-face [mat-mini-fab].mat-unthemed.dot{position:relative}ngx-mat-timepicker-face [mat-mini-fab].mat-unthemed.dot:after{content:\" \";background-color:#777;width:3px;height:3px;border-radius:50%;left:50%;top:50%;position:absolute;transform:translate(-50%,-50%)}ngx-mat-timepicker-face .clock-face{width:290px;height:290px;border-radius:50%;position:relative;display:flex;justify-content:center;box-sizing:border-box;background-color:#c8c8c880!important}ngx-mat-timepicker-face .clock-face__inner{position:absolute;top:0;left:0;width:100%;height:100%}ngx-mat-timepicker-face .clock-face [mat-mini-fab].mat-void{box-shadow:none;background-color:transparent}ngx-mat-timepicker-face .clock-face [mat-mini-fab].mat-void>span.mat-mdc-button-persistent-ripple{display:none}ngx-mat-timepicker-face .clock-face__container{margin-left:-2px}ngx-mat-timepicker-face .clock-face__number{position:absolute;transform-origin:25px 100%;width:50px;text-align:center;z-index:2;top:calc(50% - 125px);left:calc(50% - 25px)}ngx-mat-timepicker-face .clock-face__number--outer{height:125px}ngx-mat-timepicker-face .clock-face__number--outer>span{font-size:16px}ngx-mat-timepicker-face .clock-face__number--inner>span{font-size:14px}ngx-mat-timepicker-face .clock-face__clock-hand{height:103px;width:2px;padding:0;transform-origin:1px 100%;position:absolute;top:calc(50% - 103px);z-index:1}ngx-mat-timepicker-face .clock-face__center{width:8px;height:8px;padding:0;position:absolute;border-radius:50%;top:50%;left:50%;margin:-4px}ngx-mat-timepicker-face .clock-face__clock-hand_minute>button{position:absolute;top:-22px;left:calc(50% - 20px);box-sizing:content-box;display:flex;justify-content:center;align-items:center}ngx-mat-timepicker-face .clock-face__clock-hand_minute>button .clock-face__clock-hand_minute_dot{display:block;width:4px;height:4px;background:#fff;border-radius:50%}@media (max-device-width: 1023px) and (orientation: landscape){ngx-mat-timepicker-face .clock-face{width:250px;height:250px}}@media screen and (max-width: 360px){ngx-mat-timepicker-face .clock-face{width:250px;height:250px}}\n"], dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatMiniFabButton, selector: "button[mat-mini-fab]", exportAs: ["matButton"] }, { kind: "directive", type: NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "directive", type: NgFor, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "ngmodule", type: MatToolbarModule }, { kind: "component", type: i6.MatToolbar, selector: "mat-toolbar", inputs: ["color"], exportAs: ["matToolbar"] }, { kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "pipe", type: SlicePipe, name: "slice" }, { kind: "pipe", type: NgxMatTimepickerActiveHourPipe, name: "activeHour" }, { kind: "pipe", type: NgxMatTimepickerActiveMinutePipe, name: "activeMinute" }, { kind: "pipe", type: NgxMatTimepickerMinutesFormatterPipe, name: "minutesFormatter" }, { kind: "pipe", type: NgxMatTimepickerTimeLocalizerPipe, name: "timeLocalizer" }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerFaceComponent, decorators: [{
            type: Component,
            args: [{ selector: "ngx-mat-timepicker-face", changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, imports: [
                        MatButtonModule,
                        NgStyle,
                        NgFor,
                        NgIf,
                        NgTemplateOutlet,
                        MatToolbarModule,
                        NgClass,
                        SlicePipe,
                        NgxMatTimepickerActiveHourPipe,
                        NgxMatTimepickerActiveMinutePipe,
                        NgxMatTimepickerMinutesFormatterPipe,
                        NgxMatTimepickerTimeLocalizerPipe
                    ], template: "<!-- DEFAULT TEMPLATES - START -->\n<ng-template #hourButton\n             let-time>\n    <button mat-mini-fab\n            disableRipple\n            class=\"mat-elevation-z0\"\n            [color]=\"(time.time | activeHour: selectedTime?.time : isClockFaceDisabled) ? color : undefined\"\n            [ngStyle]=\"{'transform': 'rotateZ(-'+ time.angle +'deg)'}\"\n            [disabled]=\"time.disabled\">\n        {{time.time | timeLocalizer: timeUnit.HOUR}}\n    </button>\n</ng-template>\n<ng-template #minutesFace>\n    <div class=\"clock-face__container\">\n        <div class=\"clock-face__number clock-face__number--outer\"\n             [ngStyle]=\"{'transform': 'rotateZ('+ time.angle +'deg)'}\"\n             *ngFor=\"let time of faceTime; trackBy: trackByTime\">\n\t\t\t<input #current\n\t\t\t\t   type=\"hidden\"\n\t\t\t\t   [value]=\"time.time | minutesFormatter: minutesGap | timeLocalizer: timeUnit.MINUTE\" />\n            <button mat-mini-fab\n                    disableRipple\n                    class=\"mat-elevation-z0\"\n\t\t\t\t\t[class.dot]=\"dottedMinutesInGap && current.value === '' && !(time.time | activeMinute: selectedTime?.time:1:isClockFaceDisabled)\"\n                    [color]=\"(time.time | activeMinute: selectedTime?.time:minutesGap:isClockFaceDisabled) ? color : undefined\"\n                    [ngStyle]=\"{'transform': 'rotateZ(-'+ time.angle +'deg)'}\"\n                    [disabled]=\"time.disabled\">\n                {{current.value}}\n            </button>\n        </div>\n    </div>\n</ng-template>\n<!-- DEFAULT TEMPLATES - END -->\n<div class=\"clock-face\"\n     #clockFace>\n    <div *ngIf=\"unit !== timeUnit.MINUTE;else minutesFace\"\n         class=\"clock-face__container\">\n        <div class=\"clock-face__number clock-face__number--outer\"\n             [ngStyle]=\"{'transform': 'rotateZ('+ time.angle +'deg)'}\"\n             *ngFor=\"let time of faceTime | slice: 0 : 12; trackBy: trackByTime\">\n            <ng-content *ngTemplateOutlet=\"hourButton; context: {$implicit: time}\"></ng-content>\n        </div>\n        <div class=\"clock-face__inner\"\n             *ngIf=\"faceTime.length > 12\">\n            <div class=\"clock-face__number clock-face__number--inner\"\n                 [style.top]=\"'calc(50% - ' + innerClockFaceSize + 'px)'\"\n                 [ngStyle]=\"{'transform': 'rotateZ('+ time.angle +'deg)'}\"\n                 [style.height.px]=\"innerClockFaceSize\"\n                 *ngFor=\"let time of faceTime | slice: 12 : 24; trackBy: trackByTime\">\n                <ng-content *ngTemplateOutlet=\"hourButton; context: {$implicit: time}\"></ng-content>\n            </div>\n        </div>\n    </div>\n    <mat-toolbar class=\"clock-face__clock-hand\"\n                 [color]=\"color\"\n                 [ngClass]=\"{'clock-face__clock-hand_minute': unit === timeUnit.MINUTE}\"\n                 #clockHand\n                 [hidden]=\"isClockFaceDisabled\">\n        <button mat-mini-fab\n                *ngIf=\"unit === timeUnit.MINUTE\"\n                [color]=\"color\">\n            <span class=\"clock-face__clock-hand_minute_dot\"></span>\n        </button>\n    </mat-toolbar>\n    <mat-toolbar class=\"clock-face__center\"\n                 [color]=\"color\"></mat-toolbar>\n</div>\n", styles: ["ngx-mat-timepicker-face [mat-mini-fab].mat-unthemed{--mdc-fab-small-container-color: transparent;--mat-fab-small-disabled-state-container-color: transparent;--mat-fab-hover-state-layer-opacity: 0;box-shadow:none}ngx-mat-timepicker-face [mat-mini-fab].mat-unthemed .mat-mdc-button-persistent-ripple{display:none}ngx-mat-timepicker-face [mat-mini-fab].mat-unthemed.dot{position:relative}ngx-mat-timepicker-face [mat-mini-fab].mat-unthemed.dot:after{content:\" \";background-color:#777;width:3px;height:3px;border-radius:50%;left:50%;top:50%;position:absolute;transform:translate(-50%,-50%)}ngx-mat-timepicker-face .clock-face{width:290px;height:290px;border-radius:50%;position:relative;display:flex;justify-content:center;box-sizing:border-box;background-color:#c8c8c880!important}ngx-mat-timepicker-face .clock-face__inner{position:absolute;top:0;left:0;width:100%;height:100%}ngx-mat-timepicker-face .clock-face [mat-mini-fab].mat-void{box-shadow:none;background-color:transparent}ngx-mat-timepicker-face .clock-face [mat-mini-fab].mat-void>span.mat-mdc-button-persistent-ripple{display:none}ngx-mat-timepicker-face .clock-face__container{margin-left:-2px}ngx-mat-timepicker-face .clock-face__number{position:absolute;transform-origin:25px 100%;width:50px;text-align:center;z-index:2;top:calc(50% - 125px);left:calc(50% - 25px)}ngx-mat-timepicker-face .clock-face__number--outer{height:125px}ngx-mat-timepicker-face .clock-face__number--outer>span{font-size:16px}ngx-mat-timepicker-face .clock-face__number--inner>span{font-size:14px}ngx-mat-timepicker-face .clock-face__clock-hand{height:103px;width:2px;padding:0;transform-origin:1px 100%;position:absolute;top:calc(50% - 103px);z-index:1}ngx-mat-timepicker-face .clock-face__center{width:8px;height:8px;padding:0;position:absolute;border-radius:50%;top:50%;left:50%;margin:-4px}ngx-mat-timepicker-face .clock-face__clock-hand_minute>button{position:absolute;top:-22px;left:calc(50% - 20px);box-sizing:content-box;display:flex;justify-content:center;align-items:center}ngx-mat-timepicker-face .clock-face__clock-hand_minute>button .clock-face__clock-hand_minute_dot{display:block;width:4px;height:4px;background:#fff;border-radius:50%}@media (max-device-width: 1023px) and (orientation: landscape){ngx-mat-timepicker-face .clock-face{width:250px;height:250px}}@media screen and (max-width: 360px){ngx-mat-timepicker-face .clock-face{width:250px;height:250px}}\n"] }]
        }], propDecorators: { clockFace: [{
                type: ViewChild,
                args: ["clockFace", { static: true }]
            }], clockHand: [{
                type: ViewChild,
                args: ["clockHand", { static: true, read: ElementRef }]
            }], color: [{
                type: Input
            }], dottedMinutesInGap: [{
                type: Input
            }], faceTime: [{
                type: Input
            }], format: [{
                type: Input
            }], minutesGap: [{
                type: Input
            }], selectedTime: [{
                type: Input
            }], timeChange: [{
                type: Output
            }], timeSelected: [{
                type: Output
            }], unit: [{
                type: Input
            }], onMousedown: [{
                type: HostListener,
                args: ["mousedown", ["$event"]]
            }], onMouseup: [{
                type: HostListener,
                args: ["mouseup", ["$event"]]
            }], selectTime: [{
                type: HostListener,
                args: ["click", ["$event"]]
            }, {
                type: HostListener,
                args: ["touchmove", ["$event.changedTouches[0]"]]
            }, {
                type: HostListener,
                args: ["touchend", ["$event.changedTouches[0]"]]
            }, {
                type: HostListener,
                args: ["mousemove", ["$event"]]
            }] } });

class NgxMatTimepickerMinutesFaceComponent {
    set color(newValue) {
        this._color = newValue;
    }
    get color() {
        return this._color;
    }
    constructor() {
        this.minuteChange = new EventEmitter();
        this.minutesList = [];
        this.timeUnit = NgxMatTimepickerUnits;
        this._color = "primary";
    }
    ngOnChanges(changes) {
        // tslint:disable-next-line:no-string-literal
        if (changes["period"] && changes["period"].currentValue) {
            const minutes = NgxMatTimepickerUtils.getMinutes(this.minutesGap);
            this.minutesList = NgxMatTimepickerUtils.disableMinutes(minutes, this.selectedHour, {
                min: this.minTime,
                max: this.maxTime,
                format: this.format,
                period: this.period
            });
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerMinutesFaceComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerMinutesFaceComponent, isStandalone: true, selector: "ngx-mat-timepicker-minutes-face", inputs: { color: "color", dottedMinutesInGap: "dottedMinutesInGap", format: "format", maxTime: "maxTime", minTime: "minTime", minutesGap: "minutesGap", period: "period", selectedHour: "selectedHour", selectedMinute: "selectedMinute" }, outputs: { minuteChange: "minuteChange" }, usesOnChanges: true, ngImport: i0, template: "<ngx-mat-timepicker-face [color]=\"color\"\n\t\t\t\t\t\t [dottedMinutesInGap]=\"dottedMinutesInGap\"\n\t\t\t\t\t\t [faceTime]=\"minutesList\"\n\t\t\t\t\t\t [selectedTime]=\"selectedMinute\"\n\t\t\t\t\t\t [minutesGap]=\"minutesGap\"\n\t\t\t\t\t\t (timeChange)=\"minuteChange.next($event)\"\n\t\t\t\t\t\t [unit]=\"timeUnit.MINUTE\"></ngx-mat-timepicker-face>\n", dependencies: [{ kind: "component", type: NgxMatTimepickerFaceComponent, selector: "ngx-mat-timepicker-face", inputs: ["color", "dottedMinutesInGap", "faceTime", "format", "minutesGap", "selectedTime", "unit"], outputs: ["timeChange", "timeSelected"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerMinutesFaceComponent, decorators: [{
            type: Component,
            args: [{ selector: "ngx-mat-timepicker-minutes-face", imports: [NgxMatTimepickerFaceComponent], template: "<ngx-mat-timepicker-face [color]=\"color\"\n\t\t\t\t\t\t [dottedMinutesInGap]=\"dottedMinutesInGap\"\n\t\t\t\t\t\t [faceTime]=\"minutesList\"\n\t\t\t\t\t\t [selectedTime]=\"selectedMinute\"\n\t\t\t\t\t\t [minutesGap]=\"minutesGap\"\n\t\t\t\t\t\t (timeChange)=\"minuteChange.next($event)\"\n\t\t\t\t\t\t [unit]=\"timeUnit.MINUTE\"></ngx-mat-timepicker-face>\n" }]
        }], ctorParameters: () => [], propDecorators: { color: [{
                type: Input
            }], dottedMinutesInGap: [{
                type: Input
            }], format: [{
                type: Input
            }], maxTime: [{
                type: Input
            }], minTime: [{
                type: Input
            }], minuteChange: [{
                type: Output
            }], minutesGap: [{
                type: Input
            }], period: [{
                type: Input
            }], selectedHour: [{
                type: Input
            }], selectedMinute: [{
                type: Input
            }] } });

class NgxMatTimepickerHoursFaceDirective {
    set color(newValue) {
        this._color = newValue;
    }
    get color() {
        return this._color;
    }
    set format(newValue) {
        this._format = newValue;
        this.hoursList = NgxMatTimepickerUtils.getHours(this._format);
    }
    get format() {
        return this._format;
    }
    constructor() {
        this.hourChange = new EventEmitter();
        this.hourSelected = new EventEmitter();
        this.hoursList = [];
        this._color = "primary";
        this._format = 24;
    }
    onTimeSelected(time) {
        this.hourSelected.next(time);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerHoursFaceDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerHoursFaceDirective, isStandalone: true, selector: "[ngxMatTimepickerHoursFace]", inputs: { color: "color", format: "format", maxTime: "maxTime", minTime: "minTime", selectedHour: "selectedHour" }, outputs: { hourChange: "hourChange", hourSelected: "hourSelected" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerHoursFaceDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: "[ngxMatTimepickerHoursFace]",
                    standalone: true
                }]
        }], ctorParameters: () => [], propDecorators: { color: [{
                type: Input
            }], format: [{
                type: Input
            }], hourChange: [{
                type: Output
            }], hourSelected: [{
                type: Output
            }], maxTime: [{
                type: Input
            }], minTime: [{
                type: Input
            }], selectedHour: [{
                type: Input
            }] } });

class NgxMatTimepicker12HoursFaceComponent extends NgxMatTimepickerHoursFaceDirective {
    constructor() {
        super();
        this.format = 12;
    }
    ngOnChanges(changes) {
        // tslint:disable-next-line:no-string-literal
        if (changes["period"] && changes["period"].currentValue) {
            this.hoursList = NgxMatTimepickerUtils.disableHours(this.hoursList, {
                min: this.minTime,
                max: this.maxTime,
                format: this.format,
                period: this.period
            });
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepicker12HoursFaceComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepicker12HoursFaceComponent, isStandalone: true, selector: "ngx-mat-timepicker-12-hours-face", inputs: { period: "period" }, usesInheritance: true, usesOnChanges: true, ngImport: i0, template: "<ngx-mat-timepicker-face [color]=\"color\"\n                     [selectedTime]=\"selectedHour\"\n                     [faceTime]=\"hoursList\"\n                     (timeChange)=\"hourChange.next($event)\"\n                     (timeSelected)=\"onTimeSelected($event)\"></ngx-mat-timepicker-face>\n", dependencies: [{ kind: "component", type: NgxMatTimepickerFaceComponent, selector: "ngx-mat-timepicker-face", inputs: ["color", "dottedMinutesInGap", "faceTime", "format", "minutesGap", "selectedTime", "unit"], outputs: ["timeChange", "timeSelected"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepicker12HoursFaceComponent, decorators: [{
            type: Component,
            args: [{ selector: "ngx-mat-timepicker-12-hours-face", changeDetection: ChangeDetectionStrategy.OnPush, imports: [NgxMatTimepickerFaceComponent], template: "<ngx-mat-timepicker-face [color]=\"color\"\n                     [selectedTime]=\"selectedHour\"\n                     [faceTime]=\"hoursList\"\n                     (timeChange)=\"hourChange.next($event)\"\n                     (timeSelected)=\"onTimeSelected($event)\"></ngx-mat-timepicker-face>\n" }]
        }], ctorParameters: () => [], propDecorators: { period: [{
                type: Input
            }] } });

class NgxMatTimepicker24HoursFaceComponent extends NgxMatTimepickerHoursFaceDirective {
    constructor() {
        super();
        this.format = 24;
    }
    ngAfterContentInit() {
        this.hoursList = NgxMatTimepickerUtils.disableHours(this.hoursList, {
            min: this.minTime,
            max: this.maxTime,
            format: this.format
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepicker24HoursFaceComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepicker24HoursFaceComponent, isStandalone: true, selector: "ngx-mat-timepicker-24-hours-face", usesInheritance: true, ngImport: i0, template: "<ngx-mat-timepicker-face [color]=\"color\"\n                     [selectedTime]=\"selectedHour\"\n                     [faceTime]=\"hoursList\"\n                     [format]=\"format\"\n                     (timeChange)=\"hourChange.next($event)\"\n                     (timeSelected)=\"onTimeSelected($event)\"></ngx-mat-timepicker-face>\n", dependencies: [{ kind: "component", type: NgxMatTimepickerFaceComponent, selector: "ngx-mat-timepicker-face", inputs: ["color", "dottedMinutesInGap", "faceTime", "format", "minutesGap", "selectedTime", "unit"], outputs: ["timeChange", "timeSelected"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepicker24HoursFaceComponent, decorators: [{
            type: Component,
            args: [{ selector: "ngx-mat-timepicker-24-hours-face", changeDetection: ChangeDetectionStrategy.OnPush, imports: [NgxMatTimepickerFaceComponent], template: "<ngx-mat-timepicker-face [color]=\"color\"\n                     [selectedTime]=\"selectedHour\"\n                     [faceTime]=\"hoursList\"\n                     [format]=\"format\"\n                     (timeChange)=\"hourChange.next($event)\"\n                     (timeSelected)=\"onTimeSelected($event)\"></ngx-mat-timepicker-face>\n" }]
        }], ctorParameters: () => [] });

class NgxMatTimepickerPeriodComponent {
    constructor(_overlay) {
        this._overlay = _overlay;
        this.isPeriodAvailable = true;
        this.overlayScrollStrategy = this._overlay.scrollStrategies.reposition();
        this.periodChanged = new EventEmitter();
        this.timePeriod = NgxMatTimepickerPeriods;
    }
    animationDone() {
        this.isPeriodAvailable = true;
    }
    changePeriod(period) {
        this.isPeriodAvailable = this._isSwitchPeriodAvailable(period);
        if (this.isPeriodAvailable) {
            this.periodChanged.next(period);
        }
    }
    _getDisabledTimeByPeriod(period) {
        switch (this.activeTimeUnit) {
            case NgxMatTimepickerUnits.HOUR:
                return NgxMatTimepickerUtils.disableHours(this.hours, {
                    min: this.minTime,
                    max: this.maxTime,
                    format: this.format,
                    period
                });
            case NgxMatTimepickerUnits.MINUTE:
                return NgxMatTimepickerUtils.disableMinutes(this.minutes, +this.selectedHour, {
                    min: this.minTime,
                    max: this.maxTime,
                    format: this.format,
                    period
                });
            default:
                throw new Error("no such NgxMatTimepickerUnits");
        }
    }
    _isSwitchPeriodAvailable(period) {
        const time = this._getDisabledTimeByPeriod(period);
        return !time.every(t => t.disabled);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerPeriodComponent, deps: [{ token: i1$1.Overlay }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerPeriodComponent, isStandalone: true, selector: "ngx-mat-timepicker-period", inputs: { activeTimeUnit: "activeTimeUnit", format: "format", hours: "hours", maxTime: "maxTime", meridiems: "meridiems", minTime: "minTime", minutes: "minutes", selectedHour: "selectedHour", selectedPeriod: "selectedPeriod" }, outputs: { periodChanged: "periodChanged" }, ngImport: i0, template: "<div class=\"timepicker-period\"\n\t cdkOverlayOrigin\n     #eventPanelOrigin=\"cdkOverlayOrigin\">\n\t<button class=\"timepicker-dial__item timepicker-period__btn\"\n\t\t\t[ngClass]=\"{'active': selectedPeriod === timePeriod.AM}\"\n\t\t\t(click)=\"changePeriod(timePeriod.AM)\"\n\t\t\ttype=\"button\">{{meridiems[0]}}</button>\n\t<button class=\"timepicker-dial__item timepicker-period__btn\"\n\t\t\t[ngClass]=\"{'active': selectedPeriod === timePeriod.PM}\"\n\t\t\t(click)=\"changePeriod(timePeriod.PM)\"\n\t\t\ttype=\"button\">{{meridiems[1]}}</button>\n</div>\n<ng-template\n\t\tcdkConnectedOverlay\n\t\tcdkConnectedOverlayPanelClass=\"todo-remove-pointer-events-if-necessary\"\n\t\t[cdkConnectedOverlayScrollStrategy]=\"overlayScrollStrategy\"\n\t\t[cdkConnectedOverlayPositionStrategy]=\"overlayPositionStrategy\"\n\t\t[cdkConnectedOverlayOrigin]=\"eventPanelOrigin\"\n\t\t[cdkConnectedOverlayOpen]=\"!isPeriodAvailable\">\n\t<div class=\"timepicker-period__warning\"\n\t\t *ngIf=\"!isPeriodAvailable\"\n\t\t [@scaleInOut]\n\t\t (@scaleInOut.done)=\"animationDone()\">\n\t\t<p>Current time would be invalid in this period.</p>\n\t</div>\n</ng-template>\n", styles: [".timepicker-period{display:flex;flex-direction:column;position:relative}.timepicker-period__btn{opacity:.5;padding:1px 3px;border:0;background-color:transparent;font-size:18px;font-weight:500;-webkit-user-select:none;user-select:none;outline:none;border-radius:3px;transition:background-color .5s;color:inherit}.timepicker-period__btn.active{opacity:1}.timepicker-period__btn:focus{background-color:#00000012}.timepicker-period__warning{padding:5px 10px;border-radius:3px;background-color:#0000008c;position:absolute;width:200px;left:-20px;top:40px}.timepicker-period__warning>p{margin:0;font-size:12px;font-weight:700;color:#fff}\n"], dependencies: [{ kind: "directive", type: CdkOverlayOrigin, selector: "[cdk-overlay-origin], [overlay-origin], [cdkOverlayOrigin]", exportAs: ["cdkOverlayOrigin"] }, { kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: CdkConnectedOverlay, selector: "[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]", inputs: ["cdkConnectedOverlayOrigin", "cdkConnectedOverlayPositions", "cdkConnectedOverlayPositionStrategy", "cdkConnectedOverlayOffsetX", "cdkConnectedOverlayOffsetY", "cdkConnectedOverlayWidth", "cdkConnectedOverlayHeight", "cdkConnectedOverlayMinWidth", "cdkConnectedOverlayMinHeight", "cdkConnectedOverlayBackdropClass", "cdkConnectedOverlayPanelClass", "cdkConnectedOverlayViewportMargin", "cdkConnectedOverlayScrollStrategy", "cdkConnectedOverlayOpen", "cdkConnectedOverlayDisableClose", "cdkConnectedOverlayTransformOriginOn", "cdkConnectedOverlayHasBackdrop", "cdkConnectedOverlayLockPosition", "cdkConnectedOverlayFlexibleDimensions", "cdkConnectedOverlayGrowAfterOpen", "cdkConnectedOverlayPush", "cdkConnectedOverlayDisposeOnNavigation"], outputs: ["backdropClick", "positionChange", "attach", "detach", "overlayKeydown", "overlayOutsideClick"], exportAs: ["cdkConnectedOverlay"] }, { kind: "directive", type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], animations: [
            trigger("scaleInOut", [
                transition(":enter", [
                    style({ transform: "scale(0)" }),
                    animate(".2s", style({ transform: "scale(1)" })),
                    sequence([
                        animate("3s", style({ opacity: 1 })),
                        animate(".3s", style({ opacity: 0 }))
                    ])
                ])
            ])
        ] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerPeriodComponent, decorators: [{
            type: Component,
            args: [{ selector: "ngx-mat-timepicker-period", animations: [
                        trigger("scaleInOut", [
                            transition(":enter", [
                                style({ transform: "scale(0)" }),
                                animate(".2s", style({ transform: "scale(1)" })),
                                sequence([
                                    animate("3s", style({ opacity: 1 })),
                                    animate(".3s", style({ opacity: 0 }))
                                ])
                            ])
                        ])
                    ], imports: [CdkOverlayOrigin, NgClass, CdkConnectedOverlay, NgIf], template: "<div class=\"timepicker-period\"\n\t cdkOverlayOrigin\n     #eventPanelOrigin=\"cdkOverlayOrigin\">\n\t<button class=\"timepicker-dial__item timepicker-period__btn\"\n\t\t\t[ngClass]=\"{'active': selectedPeriod === timePeriod.AM}\"\n\t\t\t(click)=\"changePeriod(timePeriod.AM)\"\n\t\t\ttype=\"button\">{{meridiems[0]}}</button>\n\t<button class=\"timepicker-dial__item timepicker-period__btn\"\n\t\t\t[ngClass]=\"{'active': selectedPeriod === timePeriod.PM}\"\n\t\t\t(click)=\"changePeriod(timePeriod.PM)\"\n\t\t\ttype=\"button\">{{meridiems[1]}}</button>\n</div>\n<ng-template\n\t\tcdkConnectedOverlay\n\t\tcdkConnectedOverlayPanelClass=\"todo-remove-pointer-events-if-necessary\"\n\t\t[cdkConnectedOverlayScrollStrategy]=\"overlayScrollStrategy\"\n\t\t[cdkConnectedOverlayPositionStrategy]=\"overlayPositionStrategy\"\n\t\t[cdkConnectedOverlayOrigin]=\"eventPanelOrigin\"\n\t\t[cdkConnectedOverlayOpen]=\"!isPeriodAvailable\">\n\t<div class=\"timepicker-period__warning\"\n\t\t *ngIf=\"!isPeriodAvailable\"\n\t\t [@scaleInOut]\n\t\t (@scaleInOut.done)=\"animationDone()\">\n\t\t<p>Current time would be invalid in this period.</p>\n\t</div>\n</ng-template>\n", styles: [".timepicker-period{display:flex;flex-direction:column;position:relative}.timepicker-period__btn{opacity:.5;padding:1px 3px;border:0;background-color:transparent;font-size:18px;font-weight:500;-webkit-user-select:none;user-select:none;outline:none;border-radius:3px;transition:background-color .5s;color:inherit}.timepicker-period__btn.active{opacity:1}.timepicker-period__btn:focus{background-color:#00000012}.timepicker-period__warning{padding:5px 10px;border-radius:3px;background-color:#0000008c;position:absolute;width:200px;left:-20px;top:40px}.timepicker-period__warning>p{margin:0;font-size:12px;font-weight:700;color:#fff}\n"] }]
        }], ctorParameters: () => [{ type: i1$1.Overlay }], propDecorators: { activeTimeUnit: [{
                type: Input
            }], format: [{
                type: Input
            }], hours: [{
                type: Input
            }], maxTime: [{
                type: Input
            }], meridiems: [{
                type: Input
            }], minTime: [{
                type: Input
            }], minutes: [{
                type: Input
            }], periodChanged: [{
                type: Output
            }], selectedHour: [{
                type: Input
            }], selectedPeriod: [{
                type: Input
            }] } });

class NgxMatTimepickerParserPipe {
    get _locale() {
        return this._timepickerLocaleSrv.locale;
    }
    constructor(_timepickerLocaleSrv) {
        this._timepickerLocaleSrv = _timepickerLocaleSrv;
        this._numberingSystem = DateTime.local().setLocale(this._locale).resolvedLocaleOptions().numberingSystem;
    }
    transform(time, timeUnit = NgxMatTimepickerUnits.HOUR) {
        if (time == null || time === "") {
            return "";
        }
        if (!isNaN(+time)) {
            return `${time}`;
        }
        if (timeUnit === NgxMatTimepickerUnits.MINUTE) {
            return this._parseTime(time, "mm", NgxMatTimepickerMeasure.minute).toString();
        }
        return this._parseTime(time, "HH", NgxMatTimepickerMeasure.hour).toString();
    }
    _parseTime(time, format, timeMeasure) {
        const parsedTime = DateTime.fromFormat(String(time), format, { numberingSystem: this._numberingSystem })[timeMeasure];
        if (!isNaN(parsedTime)) {
            return parsedTime;
        }
        throw new Error(`Cannot parse time - ${time}`);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerParserPipe, deps: [{ token: NgxMatTimepickerLocaleService }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerParserPipe, isStandalone: true, name: "ngxMatTimepickerParser" }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerParserPipe }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerParserPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: "ngxMatTimepickerParser",
                    standalone: true
                }]
        }, {
            type: Injectable
        }], ctorParameters: () => [{ type: NgxMatTimepickerLocaleService }] });

class NgxMatTimepickerAutofocusDirective {
    constructor(_element, _document) {
        this._element = _element;
        this._document = _document;
        this._activeElement = this._document.activeElement;
    }
    ngOnChanges() {
        if (this.isFocusActive) {
            // To avoid ExpressionChangedAfterItHasBeenCheckedError;
            setTimeout(() => this._element.nativeElement.focus({ preventScroll: true }));
        }
    }
    ngOnDestroy() {
        // To avoid ExpressionChangedAfterItHasBeenCheckedError;
        setTimeout(() => this._activeElement.focus({ preventScroll: true }));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerAutofocusDirective, deps: [{ token: i0.ElementRef }, { token: DOCUMENT, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerAutofocusDirective, isStandalone: true, selector: "[ngxMatTimepickerAutofocus]", inputs: { isFocusActive: ["ngxMatTimepickerAutofocus", "isFocusActive"] }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerAutofocusDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: "[ngxMatTimepickerAutofocus]",
                    standalone: true
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DOCUMENT]
                }] }], propDecorators: { isFocusActive: [{
                type: Input,
                args: ["ngxMatTimepickerAutofocus"]
            }] } });

function retainSelection() {
    this.selectionStart = this.selectionEnd;
}
class NgxMatTimepickerDialControlComponent {
    get _selectedTime() {
        if (!!this.time) {
            return this.timeList.find(t => t.time === +this.time);
        }
        return undefined;
    }
    constructor(_elRef, _timeParserPipe) {
        this._elRef = _elRef;
        this._timeParserPipe = _timeParserPipe;
        this.focused = new EventEmitter();
        this.timeChanged = new EventEmitter();
        this.timeUnitChanged = new EventEmitter();
        this.unfocused = new EventEmitter();
    }
    changeTimeByKeyboard(e) {
        const char = String.fromCharCode(e.keyCode);
        if (isTimeDisabledToChange(this.time, char, this.timeList)) {
            e.preventDefault();
        }
    }
    ngAfterViewInit() {
        this._elRef.nativeElement.querySelector("input").addEventListener("select", retainSelection, false);
    }
    ngOnDestroy() {
        this._elRef.nativeElement.querySelector("input").removeEventListener("select", retainSelection);
    }
    onKeydown(e) {
        if (!NgxMatTimepickerUtils.isDigit(e)) {
            e.preventDefault();
        }
        else {
            this._changeTimeByArrow(e.keyCode);
        }
    }
    onModelChange(value) {
        this.time = this._timeParserPipe.transform(value, this.timeUnit);
    }
    saveTimeAndChangeTimeUnit(event, unit) {
        event.preventDefault();
        this.previousTime = this.time;
        this.timeUnitChanged.next(unit);
        this.focused.next();
    }
    updateTime() {
        if (this._selectedTime) {
            this.timeChanged.next(this._selectedTime);
            this.previousTime = this._selectedTime.time;
        }
    }
    _addTime(amount) {
        return `0${+this.time + amount}`.substr(-2);
    }
    _changeTimeByArrow(keyCode) {
        let time;
        // arrow up
        if (keyCode === 38) {
            time = this._addTime(this.minutesGap || 1);
        }
        // arrow down
        else if (keyCode === 40) {
            time = this._addTime(-1 * (this.minutesGap || 1));
        }
        if (!isTimeUnavailable(time, this.timeList)) {
            this.time = time;
            this.updateTime();
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerDialControlComponent, deps: [{ token: i0.ElementRef }, { token: NgxMatTimepickerParserPipe }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerDialControlComponent, isStandalone: true, selector: "ngx-mat-timepicker-dial-control", inputs: { disabled: "disabled", isActive: "isActive", isEditable: "isEditable", minutesGap: "minutesGap", time: "time", timeList: "timeList", timeUnit: "timeUnit" }, outputs: { focused: "focused", timeChanged: "timeChanged", timeUnitChanged: "timeUnitChanged", unfocused: "unfocused" }, providers: [NgxMatTimepickerParserPipe], ngImport: i0, template: "<input class=\"timepicker-dial__control timepicker-dial__item\"\n       [ngClass]=\"{'active': isActive}\"\n       [ngModel]=\"time | timeLocalizer: timeUnit: true\"\n       (ngModelChange)=\"time = $event\"\n       [disabled]=\"disabled\"\n       (input)=\"updateTime()\"\n       (focus)=\"saveTimeAndChangeTimeUnit($event, timeUnit)\"\n       readonly\n       [ngxMatTimepickerAutofocus]=\"isActive\"\n       *ngIf=\"!isEditable;else editableTemplate\">\n\n<ng-template #editableTemplate>\n    <input class=\"timepicker-dial__control timepicker-dial__item timepicker-dial__control_editable\"\n           [ngClass]=\"{'active': isActive}\"\n           [ngModel]=\"time | ngxMatTimepickerParser: timeUnit | timeLocalizer: timeUnit : true\"\n           (ngModelChange)=\"onModelChange($event)\"\n           [disabled]=\"disabled\"\n           (input)=\"updateTime()\"\n           (focus)=\"saveTimeAndChangeTimeUnit($event, timeUnit)\"\n           [ngxMatTimepickerAutofocus]=\"isActive\"\n           (keydown)=\"onKeydown($event)\"\n           (keypress)=\"changeTimeByKeyboard($event)\">\n</ng-template>\n", styles: [".timepicker-dial__control{border:none;background-color:transparent;font-size:50px;width:60px;padding:0;border-radius:3px;text-align:center;color:inherit}.timepicker-dial__control:focus{outline:none;background-color:#0000001a}.timepicker-dial__control:disabled{cursor:default}\n"], dependencies: [{ kind: "directive", type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i4.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i4.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i4.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: NgxMatTimepickerAutofocusDirective, selector: "[ngxMatTimepickerAutofocus]", inputs: ["ngxMatTimepickerAutofocus"] }, { kind: "pipe", type: NgxMatTimepickerParserPipe, name: "ngxMatTimepickerParser" }, { kind: "pipe", type: NgxMatTimepickerTimeLocalizerPipe, name: "timeLocalizer" }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerDialControlComponent, decorators: [{
            type: Component,
            args: [{ selector: "ngx-mat-timepicker-dial-control", providers: [NgxMatTimepickerParserPipe], imports: [
                        NgIf,
                        FormsModule,
                        NgClass,
                        NgxMatTimepickerAutofocusDirective,
                        NgxMatTimepickerParserPipe,
                        NgxMatTimepickerTimeLocalizerPipe
                    ], template: "<input class=\"timepicker-dial__control timepicker-dial__item\"\n       [ngClass]=\"{'active': isActive}\"\n       [ngModel]=\"time | timeLocalizer: timeUnit: true\"\n       (ngModelChange)=\"time = $event\"\n       [disabled]=\"disabled\"\n       (input)=\"updateTime()\"\n       (focus)=\"saveTimeAndChangeTimeUnit($event, timeUnit)\"\n       readonly\n       [ngxMatTimepickerAutofocus]=\"isActive\"\n       *ngIf=\"!isEditable;else editableTemplate\">\n\n<ng-template #editableTemplate>\n    <input class=\"timepicker-dial__control timepicker-dial__item timepicker-dial__control_editable\"\n           [ngClass]=\"{'active': isActive}\"\n           [ngModel]=\"time | ngxMatTimepickerParser: timeUnit | timeLocalizer: timeUnit : true\"\n           (ngModelChange)=\"onModelChange($event)\"\n           [disabled]=\"disabled\"\n           (input)=\"updateTime()\"\n           (focus)=\"saveTimeAndChangeTimeUnit($event, timeUnit)\"\n           [ngxMatTimepickerAutofocus]=\"isActive\"\n           (keydown)=\"onKeydown($event)\"\n           (keypress)=\"changeTimeByKeyboard($event)\">\n</ng-template>\n", styles: [".timepicker-dial__control{border:none;background-color:transparent;font-size:50px;width:60px;padding:0;border-radius:3px;text-align:center;color:inherit}.timepicker-dial__control:focus{outline:none;background-color:#0000001a}.timepicker-dial__control:disabled{cursor:default}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: NgxMatTimepickerParserPipe }], propDecorators: { disabled: [{
                type: Input
            }], focused: [{
                type: Output
            }], isActive: [{
                type: Input
            }], isEditable: [{
                type: Input
            }], minutesGap: [{
                type: Input
            }], time: [{
                type: Input
            }], timeChanged: [{
                type: Output
            }], timeList: [{
                type: Input
            }], timeUnit: [{
                type: Input
            }], timeUnitChanged: [{
                type: Output
            }], unfocused: [{
                type: Output
            }] } });
function isTimeDisabledToChange(currentTime, nextTime, timeList) {
    const isNumber = /\d/.test(nextTime);
    if (isNumber) {
        const time = currentTime + nextTime;
        return isTimeUnavailable(time, timeList);
    }
    return undefined;
}
function isTimeUnavailable(time, timeList) {
    const selectedTime = timeList.find(value => value.time === +time);
    return !selectedTime || (selectedTime && selectedTime.disabled);
}

class NgxMatTimepickerDialComponent {
    set color(newValue) {
        this._color = newValue;
    }
    get color() {
        return this._color;
    }
    get hourString() {
        return `${this.hour}`;
    }
    get minuteString() {
        return `${this.minute}`;
    }
    get _locale() {
        return this._localeSrv.locale;
    }
    constructor(_localeSrv) {
        this._localeSrv = _localeSrv;
        this.hourChanged = new EventEmitter();
        this.meridiems = Info.meridiems({ locale: this._locale });
        this.minuteChanged = new EventEmitter();
        this.periodChanged = new EventEmitter();
        this.timeUnit = NgxMatTimepickerUnits;
        this.timeUnitChanged = new EventEmitter();
        this._color = "primary";
    }
    changeHour(hour) {
        this.hourChanged.next(hour);
    }
    changeMinute(minute) {
        this.minuteChanged.next(minute);
    }
    changePeriod(period) {
        this.periodChanged.next(period);
    }
    changeTimeUnit(unit) {
        this.timeUnitChanged.next(unit);
    }
    hideHint() {
        this.isHintVisible = false;
    }
    ngOnChanges(changes) {
        // tslint:disable-next-line:no-string-literal
        const periodChanged = changes["period"] && changes["period"].currentValue;
        // tslint:disable-next-line:no-string-literal
        if (periodChanged || changes["format"] && changes["format"].currentValue) {
            const hours = NgxMatTimepickerUtils.getHours(this.format);
            this.hours = NgxMatTimepickerUtils.disableHours(hours, {
                min: this.minTime,
                max: this.maxTime,
                format: this.format,
                period: this.period
            });
        }
        // tslint:disable-next-line:no-string-literal
        if (periodChanged || changes["hour"] && changes["hour"].currentValue) {
            const minutes = NgxMatTimepickerUtils.getMinutes(this.minutesGap);
            this.minutes = NgxMatTimepickerUtils.disableMinutes(minutes, +this.hour, {
                min: this.minTime,
                max: this.maxTime,
                format: this.format,
                period: this.period
            });
        }
    }
    showHint() {
        this.isHintVisible = true;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerDialComponent, deps: [{ token: NgxMatTimepickerLocaleService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerDialComponent, isStandalone: true, selector: "ngx-mat-timepicker-dial", inputs: { activeTimeUnit: "activeTimeUnit", color: "color", editableHintTmpl: "editableHintTmpl", format: "format", hour: "hour", hoursOnly: "hoursOnly", isEditable: "isEditable", maxTime: "maxTime", minTime: "minTime", minute: "minute", minutesGap: "minutesGap", period: "period" }, outputs: { hourChanged: "hourChanged", minuteChanged: "minuteChanged", periodChanged: "periodChanged", timeUnitChanged: "timeUnitChanged" }, usesOnChanges: true, ngImport: i0, template: "<div class=\"timepicker-dial\">\n    <div class=\"timepicker-dial__container\">\n        <div class=\"timepicker-dial__time\">\n            <ngx-mat-timepicker-dial-control [timeList]=\"hours\"\n                                         [time]=\"hourString\"\n                                         [timeUnit]=\"timeUnit.HOUR\"\n                                         [isActive]=\"activeTimeUnit === timeUnit.HOUR\"\n                                         [isEditable]=\"isEditable\"\n                                         (timeUnitChanged)=\"changeTimeUnit($event)\"\n                                         (timeChanged)=\"changeHour($event)\"\n                                         (focused)=\"showHint()\"\n                                         (unfocused)=\"hideHint()\">\n\n            </ngx-mat-timepicker-dial-control>\n            <span>:</span>\n            <ngx-mat-timepicker-dial-control [timeList]=\"minutes\"\n                                         [time]=\"minuteString\"\n                                         [timeUnit]=\"timeUnit.MINUTE\"\n                                         [isActive]=\"activeTimeUnit === timeUnit.MINUTE\"\n                                         [isEditable]=\"isEditable\"\n                                         [minutesGap]=\"minutesGap\"\n                                         [disabled]=\"hoursOnly\"\n                                         (timeUnitChanged)=\"changeTimeUnit($event)\"\n                                         (timeChanged)=\"changeMinute($event)\"\n                                         (focused)=\"showHint()\"\n                                         (unfocused)=\"hideHint()\">\n\n            </ngx-mat-timepicker-dial-control>\n        </div>\n        <ngx-mat-timepicker-period class=\"timepicker-dial__period\"\n                                   *ngIf=\"format !== 24\"\n                                   [selectedPeriod]=\"period\"\n                                   [activeTimeUnit]=\"activeTimeUnit\"\n                                   [maxTime]=\"maxTime\"\n                                   [minTime]=\"minTime\"\n                                   [format]=\"format\"\n                                   [hours]=\"hours\"\n                                   [minutes]=\"minutes\"\n                                   [selectedHour]=\"hour\"\n                                   [meridiems]=\"meridiems\"\n                                   (periodChanged)=\"changePeriod($event)\"></ngx-mat-timepicker-period>\n    </div>\n    <div *ngIf=\"isEditable || editableHintTmpl\"\n         [ngClass]=\"{'timepicker-dial__hint-container--hidden': !isHintVisible}\">\n        <ng-container *ngTemplateOutlet=\"editableHintTmpl ? editableHintTmpl : editableHintDefault\"></ng-container>\n        <ng-template #editableHintDefault>\n            <small class=\"timepicker-dial__hint\"> * use arrows (<span>&#8645;</span>) to change the time</small>\n        </ng-template>\n    </div>\n</div>\n", styles: [".timepicker-dial{text-align:center}.timepicker-dial__container{display:flex;align-items:center;justify-content:center;-webkit-tap-highlight-color:rgba(0,0,0,0)}.timepicker-dial__time{display:flex;align-items:baseline;line-height:normal;font-size:50px}.timepicker-dial__period{display:block;margin-left:10px}.timepicker-dial__hint-container--hidden{visibility:hidden}.timepicker-dial__hint{display:inline-block;font-size:10px}.timepicker-dial__hint span{font-size:14px}\n"], dependencies: [{ kind: "component", type: NgxMatTimepickerDialControlComponent, selector: "ngx-mat-timepicker-dial-control", inputs: ["disabled", "isActive", "isEditable", "minutesGap", "time", "timeList", "timeUnit"], outputs: ["focused", "timeChanged", "timeUnitChanged", "unfocused"] }, { kind: "directive", type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: NgxMatTimepickerPeriodComponent, selector: "ngx-mat-timepicker-period", inputs: ["activeTimeUnit", "format", "hours", "maxTime", "meridiems", "minTime", "minutes", "selectedHour", "selectedPeriod"], outputs: ["periodChanged"] }, { kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerDialComponent, decorators: [{
            type: Component,
            args: [{ selector: "ngx-mat-timepicker-dial", changeDetection: ChangeDetectionStrategy.OnPush, imports: [NgxMatTimepickerDialControlComponent, NgIf, NgxMatTimepickerPeriodComponent, NgClass, NgTemplateOutlet], template: "<div class=\"timepicker-dial\">\n    <div class=\"timepicker-dial__container\">\n        <div class=\"timepicker-dial__time\">\n            <ngx-mat-timepicker-dial-control [timeList]=\"hours\"\n                                         [time]=\"hourString\"\n                                         [timeUnit]=\"timeUnit.HOUR\"\n                                         [isActive]=\"activeTimeUnit === timeUnit.HOUR\"\n                                         [isEditable]=\"isEditable\"\n                                         (timeUnitChanged)=\"changeTimeUnit($event)\"\n                                         (timeChanged)=\"changeHour($event)\"\n                                         (focused)=\"showHint()\"\n                                         (unfocused)=\"hideHint()\">\n\n            </ngx-mat-timepicker-dial-control>\n            <span>:</span>\n            <ngx-mat-timepicker-dial-control [timeList]=\"minutes\"\n                                         [time]=\"minuteString\"\n                                         [timeUnit]=\"timeUnit.MINUTE\"\n                                         [isActive]=\"activeTimeUnit === timeUnit.MINUTE\"\n                                         [isEditable]=\"isEditable\"\n                                         [minutesGap]=\"minutesGap\"\n                                         [disabled]=\"hoursOnly\"\n                                         (timeUnitChanged)=\"changeTimeUnit($event)\"\n                                         (timeChanged)=\"changeMinute($event)\"\n                                         (focused)=\"showHint()\"\n                                         (unfocused)=\"hideHint()\">\n\n            </ngx-mat-timepicker-dial-control>\n        </div>\n        <ngx-mat-timepicker-period class=\"timepicker-dial__period\"\n                                   *ngIf=\"format !== 24\"\n                                   [selectedPeriod]=\"period\"\n                                   [activeTimeUnit]=\"activeTimeUnit\"\n                                   [maxTime]=\"maxTime\"\n                                   [minTime]=\"minTime\"\n                                   [format]=\"format\"\n                                   [hours]=\"hours\"\n                                   [minutes]=\"minutes\"\n                                   [selectedHour]=\"hour\"\n                                   [meridiems]=\"meridiems\"\n                                   (periodChanged)=\"changePeriod($event)\"></ngx-mat-timepicker-period>\n    </div>\n    <div *ngIf=\"isEditable || editableHintTmpl\"\n         [ngClass]=\"{'timepicker-dial__hint-container--hidden': !isHintVisible}\">\n        <ng-container *ngTemplateOutlet=\"editableHintTmpl ? editableHintTmpl : editableHintDefault\"></ng-container>\n        <ng-template #editableHintDefault>\n            <small class=\"timepicker-dial__hint\"> * use arrows (<span>&#8645;</span>) to change the time</small>\n        </ng-template>\n    </div>\n</div>\n", styles: [".timepicker-dial{text-align:center}.timepicker-dial__container{display:flex;align-items:center;justify-content:center;-webkit-tap-highlight-color:rgba(0,0,0,0)}.timepicker-dial__time{display:flex;align-items:baseline;line-height:normal;font-size:50px}.timepicker-dial__period{display:block;margin-left:10px}.timepicker-dial__hint-container--hidden{visibility:hidden}.timepicker-dial__hint{display:inline-block;font-size:10px}.timepicker-dial__hint span{font-size:14px}\n"] }]
        }], ctorParameters: () => [{ type: NgxMatTimepickerLocaleService }], propDecorators: { activeTimeUnit: [{
                type: Input
            }], color: [{
                type: Input
            }], editableHintTmpl: [{
                type: Input
            }], format: [{
                type: Input
            }], hour: [{
                type: Input
            }], hourChanged: [{
                type: Output
            }], hoursOnly: [{
                type: Input
            }], isEditable: [{
                type: Input
            }], maxTime: [{
                type: Input
            }], minTime: [{
                type: Input
            }], minute: [{
                type: Input
            }], minuteChanged: [{
                type: Output
            }], minutesGap: [{
                type: Input
            }], period: [{
                type: Input
            }], periodChanged: [{
                type: Output
            }], timeUnitChanged: [{
                type: Output
            }] } });

class NgxMatTimepickerContentComponent {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerContentComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerContentComponent, isStandalone: true, selector: "ngx-mat-timepicker-content", inputs: { appendToInput: "appendToInput", inputElement: "inputElement" }, ngImport: i0, template: "<div *ngIf=\"appendToInput;else timepickerModal\">\n\t<ng-container *ngTemplateOutlet=\"timepickerOutlet\"></ng-container>\n</div>\n<ng-template #timepickerModal>\n\t<ng-container *ngTemplateOutlet=\"timepickerOutlet\"></ng-container>\n</ng-template>\n<ng-template #timepickerOutlet>\n\t<ng-content></ng-content>\n</ng-template>\n", dependencies: [{ kind: "directive", type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerContentComponent, decorators: [{
            type: Component,
            args: [{ selector: "ngx-mat-timepicker-content", imports: [NgIf, NgTemplateOutlet], template: "<div *ngIf=\"appendToInput;else timepickerModal\">\n\t<ng-container *ngTemplateOutlet=\"timepickerOutlet\"></ng-container>\n</div>\n<ng-template #timepickerModal>\n\t<ng-container *ngTemplateOutlet=\"timepickerOutlet\"></ng-container>\n</ng-template>\n<ng-template #timepickerOutlet>\n\t<ng-content></ng-content>\n</ng-template>\n" }]
        }], propDecorators: { appendToInput: [{
                type: Input
            }], inputElement: [{
                type: Input
            }] } });

class NgxMatTimepickerDialogComponent extends NgxMatTimepickerBaseDirective {
    constructor(data, _dialogRef, timepickerSrv, eventSrv, timepickerLocaleSrv) {
        super(timepickerSrv, eventSrv, timepickerLocaleSrv, data);
        this.data = data;
        this._dialogRef = _dialogRef;
    }
    close() {
        this._dialogRef.close();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerDialogComponent, deps: [{ token: MAT_DIALOG_DATA }, { token: i1$2.MatDialogRef }, { token: NgxMatTimepickerService }, { token: NgxMatTimepickerEventService }, { token: NgxMatTimepickerLocaleService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerDialogComponent, isStandalone: true, selector: "ngx-mat-timepicker-dialog", usesInheritance: true, ngImport: i0, template: "<ng-template #cancelBtnDefault>\n\t<button mat-button\n\t\t\t[color]=\"color\">CANCEL\n\t</button>\n</ng-template>\n<ng-template #confirmBtnDefault>\n\t<button mat-button\n\t\t\t[color]=\"color\">OK\n\t</button>\n</ng-template>\n<div mat-dialog-content>\n\t<ngx-mat-timepicker-content [appendToInput]=\"data.appendToInput\"\n\t\t\t\t\t\t\t\t[inputElement]=\"data.inputElement\">\n\t\t<div class=\"timepicker\"\n\t\t\t [ngClass]=\"data.timepickerClass\">\n\t\t\t<mat-toolbar [color]=\"color\"\n\t\t\t\t\t\t [class.is-editable]=\"data.enableKeyboardInput\"\n\t\t\t\t\t\t class=\"timepicker-header\">\n\t\t\t\t<ngx-mat-timepicker-dial [color]=\"color\"\n\t\t\t\t\t\t\t\t\t\t [format]=\"data.format\"\n\t\t\t\t\t\t\t\t\t\t [hour]=\"(selectedHour | async)?.time\"\n\t\t\t\t\t\t\t\t\t\t [minute]=\"(selectedMinute | async)?.time\"\n\t\t\t\t\t\t\t\t\t\t [period]=\"selectedPeriod | async\"\n\t\t\t\t\t\t\t\t\t\t [activeTimeUnit]=\"activeTimeUnit\"\n\t\t\t\t\t\t\t\t\t\t [minTime]=\"data.minTime\"\n\t\t\t\t\t\t\t\t\t\t [maxTime]=\"data.maxTime\"\n\t\t\t\t\t\t\t\t\t\t [isEditable]=\"data.enableKeyboardInput\"\n\t\t\t\t\t\t\t\t\t\t [editableHintTmpl]=\"data.editableHintTmpl\"\n\t\t\t\t\t\t\t\t\t\t [minutesGap]=\"data.minutesGap\"\n\t\t\t\t\t\t\t\t\t\t [hoursOnly]=\"data.hoursOnly\"\n\t\t\t\t\t\t\t\t\t\t (periodChanged)=\"changePeriod($event)\"\n\t\t\t\t\t\t\t\t\t\t (timeUnitChanged)=\"changeTimeUnit($event)\"\n\t\t\t\t\t\t\t\t\t\t (hourChanged)=\"onHourChange($event)\"\n\t\t\t\t\t\t\t\t\t\t (minuteChanged)=\"onMinuteChange($event)\"\n\t\t\t\t></ngx-mat-timepicker-dial>\n\t\t\t</mat-toolbar>\n\t\t\t<div class=\"timepicker__main-content\">\n\t\t\t\t<div class=\"timepicker__body\"\n\t\t\t\t\t [ngSwitch]=\"activeTimeUnit\">\n\t\t\t\t\t<div *ngSwitchCase=\"timeUnit.HOUR\">\n\t\t\t\t\t\t<ngx-mat-timepicker-24-hours-face *ngIf=\"data.format === 24;else ampmHours\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [color]=\"color\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  (hourChange)=\"onHourChange($event)\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [selectedHour]=\"selectedHour | async\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [minTime]=\"data.minTime\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [maxTime]=\"data.maxTime\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [format]=\"data.format\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  (hourSelected)=\"onHourSelected($event)\"></ngx-mat-timepicker-24-hours-face>\n\t\t\t\t\t\t<ng-template #ampmHours>\n\t\t\t\t\t\t\t<ngx-mat-timepicker-12-hours-face\n\t\t\t\t\t\t\t\t\t[color]=\"color\"\n\t\t\t\t\t\t\t\t\t(hourChange)=\"onHourChange($event)\"\n\t\t\t\t\t\t\t\t\t[selectedHour]=\"selectedHour | async\"\n\t\t\t\t\t\t\t\t\t[period]=\"selectedPeriod | async\"\n\t\t\t\t\t\t\t\t\t[minTime]=\"data.minTime\"\n\t\t\t\t\t\t\t\t\t[maxTime]=\"data.maxTime\"\n\t\t\t\t\t\t\t\t\t(hourSelected)=\"onHourSelected($event)\"></ngx-mat-timepicker-12-hours-face>\n\t\t\t\t\t\t</ng-template>\n\t\t\t\t\t</div>\n\t\t\t\t\t<ngx-mat-timepicker-minutes-face *ngSwitchCase=\"timeUnit.MINUTE\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [color]=\"color\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [dottedMinutesInGap]=\"data.dottedMinutesInGap\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [selectedMinute]=\"selectedMinute | async\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [selectedHour]=\"(selectedHour | async)?.time\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [minTime]=\"data.minTime\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [maxTime]=\"data.maxTime\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [format]=\"data.format\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [period]=\"selectedPeriod | async\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [minutesGap]=\"data.minutesGap\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t (minuteChange)=\"onMinuteChange($event)\"></ngx-mat-timepicker-minutes-face>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t</ngx-mat-timepicker-content>\n</div>\n<div mat-dialog-actions>\n\t<div (click)=\"close()\">\n\t\t<ng-container\n\t\t\t\t*ngTemplateOutlet=\"data.cancelBtnTmpl ? data.cancelBtnTmpl : cancelBtnDefault\"></ng-container>\n\t</div>\n\t<div (click)=\"setTime()\">\n\t\t<ng-container\n\t\t\t\t*ngTemplateOutlet=\"data.confirmBtnTmpl ? data.confirmBtnTmpl : confirmBtnDefault\"></ng-container>\n\t</div>\n</div>\n", styles: ["div.ngx-mat-timepicker-dialog>mat-dialog-container{padding-top:0}div.ngx-mat-timepicker-dialog>mat-dialog-container [mat-dialog-content]{padding:0;max-height:85vh}div.ngx-mat-timepicker-dialog>mat-dialog-container [mat-dialog-content] mat-toolbar.timepicker-header{display:flex;justify-content:center;align-items:center}div.ngx-mat-timepicker-dialog>mat-dialog-container [mat-dialog-content] mat-toolbar.timepicker-header.is-editable{height:auto}div.ngx-mat-timepicker-dialog>mat-dialog-container [mat-dialog-content] .clock-face{margin:16px}div.ngx-mat-timepicker-dialog>mat-dialog-container div[mat-dialog-actions]{justify-content:flex-end;display:flex}\n"], dependencies: [{ kind: "pipe", type: AsyncPipe, name: "async" }, { kind: "directive", type: 
                // Common
                NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: NgSwitch, selector: "[ngSwitch]", inputs: ["ngSwitch"] }, { kind: "directive", type: NgSwitchCase, selector: "[ngSwitchCase]", inputs: ["ngSwitchCase"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "ngmodule", type: 
                // Material
                MatButtonModule }, { kind: "component", type: i1.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }, { kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i1$2.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i1$2.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "ngmodule", type: MatToolbarModule }, { kind: "component", type: i6.MatToolbar, selector: "mat-toolbar", inputs: ["color"], exportAs: ["matToolbar"] }, { kind: "component", type: 
                // NgxMatTimepicker
                NgxMatTimepickerContentComponent, selector: "ngx-mat-timepicker-content", inputs: ["appendToInput", "inputElement"] }, { kind: "component", type: NgxMatTimepickerDialComponent, selector: "ngx-mat-timepicker-dial", inputs: ["activeTimeUnit", "color", "editableHintTmpl", "format", "hour", "hoursOnly", "isEditable", "maxTime", "minTime", "minute", "minutesGap", "period"], outputs: ["hourChanged", "minuteChanged", "periodChanged", "timeUnitChanged"] }, { kind: "component", type: NgxMatTimepicker24HoursFaceComponent, selector: "ngx-mat-timepicker-24-hours-face" }, { kind: "component", type: NgxMatTimepicker12HoursFaceComponent, selector: "ngx-mat-timepicker-12-hours-face", inputs: ["period"] }, { kind: "component", type: NgxMatTimepickerMinutesFaceComponent, selector: "ngx-mat-timepicker-minutes-face", inputs: ["color", "dottedMinutesInGap", "format", "maxTime", "minTime", "minutesGap", "period", "selectedHour", "selectedMinute"], outputs: ["minuteChange"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: "ngx-mat-timepicker-dialog", encapsulation: ViewEncapsulation.None, imports: [
                        AsyncPipe,
                        // Common
                        NgClass,
                        NgIf,
                        NgSwitch,
                        NgSwitchCase,
                        NgTemplateOutlet,
                        // Material
                        MatButtonModule,
                        MatDialogModule,
                        MatToolbarModule,
                        // NgxMatTimepicker
                        NgxMatTimepickerContentComponent,
                        NgxMatTimepickerDialComponent,
                        NgxMatTimepicker24HoursFaceComponent,
                        NgxMatTimepicker12HoursFaceComponent,
                        NgxMatTimepickerMinutesFaceComponent
                    ], template: "<ng-template #cancelBtnDefault>\n\t<button mat-button\n\t\t\t[color]=\"color\">CANCEL\n\t</button>\n</ng-template>\n<ng-template #confirmBtnDefault>\n\t<button mat-button\n\t\t\t[color]=\"color\">OK\n\t</button>\n</ng-template>\n<div mat-dialog-content>\n\t<ngx-mat-timepicker-content [appendToInput]=\"data.appendToInput\"\n\t\t\t\t\t\t\t\t[inputElement]=\"data.inputElement\">\n\t\t<div class=\"timepicker\"\n\t\t\t [ngClass]=\"data.timepickerClass\">\n\t\t\t<mat-toolbar [color]=\"color\"\n\t\t\t\t\t\t [class.is-editable]=\"data.enableKeyboardInput\"\n\t\t\t\t\t\t class=\"timepicker-header\">\n\t\t\t\t<ngx-mat-timepicker-dial [color]=\"color\"\n\t\t\t\t\t\t\t\t\t\t [format]=\"data.format\"\n\t\t\t\t\t\t\t\t\t\t [hour]=\"(selectedHour | async)?.time\"\n\t\t\t\t\t\t\t\t\t\t [minute]=\"(selectedMinute | async)?.time\"\n\t\t\t\t\t\t\t\t\t\t [period]=\"selectedPeriod | async\"\n\t\t\t\t\t\t\t\t\t\t [activeTimeUnit]=\"activeTimeUnit\"\n\t\t\t\t\t\t\t\t\t\t [minTime]=\"data.minTime\"\n\t\t\t\t\t\t\t\t\t\t [maxTime]=\"data.maxTime\"\n\t\t\t\t\t\t\t\t\t\t [isEditable]=\"data.enableKeyboardInput\"\n\t\t\t\t\t\t\t\t\t\t [editableHintTmpl]=\"data.editableHintTmpl\"\n\t\t\t\t\t\t\t\t\t\t [minutesGap]=\"data.minutesGap\"\n\t\t\t\t\t\t\t\t\t\t [hoursOnly]=\"data.hoursOnly\"\n\t\t\t\t\t\t\t\t\t\t (periodChanged)=\"changePeriod($event)\"\n\t\t\t\t\t\t\t\t\t\t (timeUnitChanged)=\"changeTimeUnit($event)\"\n\t\t\t\t\t\t\t\t\t\t (hourChanged)=\"onHourChange($event)\"\n\t\t\t\t\t\t\t\t\t\t (minuteChanged)=\"onMinuteChange($event)\"\n\t\t\t\t></ngx-mat-timepicker-dial>\n\t\t\t</mat-toolbar>\n\t\t\t<div class=\"timepicker__main-content\">\n\t\t\t\t<div class=\"timepicker__body\"\n\t\t\t\t\t [ngSwitch]=\"activeTimeUnit\">\n\t\t\t\t\t<div *ngSwitchCase=\"timeUnit.HOUR\">\n\t\t\t\t\t\t<ngx-mat-timepicker-24-hours-face *ngIf=\"data.format === 24;else ampmHours\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [color]=\"color\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  (hourChange)=\"onHourChange($event)\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [selectedHour]=\"selectedHour | async\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [minTime]=\"data.minTime\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [maxTime]=\"data.maxTime\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [format]=\"data.format\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  (hourSelected)=\"onHourSelected($event)\"></ngx-mat-timepicker-24-hours-face>\n\t\t\t\t\t\t<ng-template #ampmHours>\n\t\t\t\t\t\t\t<ngx-mat-timepicker-12-hours-face\n\t\t\t\t\t\t\t\t\t[color]=\"color\"\n\t\t\t\t\t\t\t\t\t(hourChange)=\"onHourChange($event)\"\n\t\t\t\t\t\t\t\t\t[selectedHour]=\"selectedHour | async\"\n\t\t\t\t\t\t\t\t\t[period]=\"selectedPeriod | async\"\n\t\t\t\t\t\t\t\t\t[minTime]=\"data.minTime\"\n\t\t\t\t\t\t\t\t\t[maxTime]=\"data.maxTime\"\n\t\t\t\t\t\t\t\t\t(hourSelected)=\"onHourSelected($event)\"></ngx-mat-timepicker-12-hours-face>\n\t\t\t\t\t\t</ng-template>\n\t\t\t\t\t</div>\n\t\t\t\t\t<ngx-mat-timepicker-minutes-face *ngSwitchCase=\"timeUnit.MINUTE\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [color]=\"color\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [dottedMinutesInGap]=\"data.dottedMinutesInGap\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [selectedMinute]=\"selectedMinute | async\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [selectedHour]=\"(selectedHour | async)?.time\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [minTime]=\"data.minTime\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [maxTime]=\"data.maxTime\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [format]=\"data.format\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [period]=\"selectedPeriod | async\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [minutesGap]=\"data.minutesGap\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t (minuteChange)=\"onMinuteChange($event)\"></ngx-mat-timepicker-minutes-face>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t</ngx-mat-timepicker-content>\n</div>\n<div mat-dialog-actions>\n\t<div (click)=\"close()\">\n\t\t<ng-container\n\t\t\t\t*ngTemplateOutlet=\"data.cancelBtnTmpl ? data.cancelBtnTmpl : cancelBtnDefault\"></ng-container>\n\t</div>\n\t<div (click)=\"setTime()\">\n\t\t<ng-container\n\t\t\t\t*ngTemplateOutlet=\"data.confirmBtnTmpl ? data.confirmBtnTmpl : confirmBtnDefault\"></ng-container>\n\t</div>\n</div>\n", styles: ["div.ngx-mat-timepicker-dialog>mat-dialog-container{padding-top:0}div.ngx-mat-timepicker-dialog>mat-dialog-container [mat-dialog-content]{padding:0;max-height:85vh}div.ngx-mat-timepicker-dialog>mat-dialog-container [mat-dialog-content] mat-toolbar.timepicker-header{display:flex;justify-content:center;align-items:center}div.ngx-mat-timepicker-dialog>mat-dialog-container [mat-dialog-content] mat-toolbar.timepicker-header.is-editable{height:auto}div.ngx-mat-timepicker-dialog>mat-dialog-container [mat-dialog-content] .clock-face{margin:16px}div.ngx-mat-timepicker-dialog>mat-dialog-container div[mat-dialog-actions]{justify-content:flex-end;display:flex}\n"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DIALOG_DATA]
                }] }, { type: i1$2.MatDialogRef }, { type: NgxMatTimepickerService }, { type: NgxMatTimepickerEventService }, { type: NgxMatTimepickerLocaleService }] });

class NgxMatTimepickerStandaloneComponent extends NgxMatTimepickerBaseDirective {
    constructor(data, timepickerSrv, eventSrv, timepickerLocaleSrv) {
        super(timepickerSrv, eventSrv, timepickerLocaleSrv, data);
        this.data = data;
    }
    close() {
        this.data.timepickerBaseRef.close();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerStandaloneComponent, deps: [{ token: NGX_MAT_TIMEPICKER_CONFIG }, { token: NgxMatTimepickerService }, { token: NgxMatTimepickerEventService }, { token: NgxMatTimepickerLocaleService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerStandaloneComponent, isStandalone: true, selector: "ngx-mat-timepicker-standalone", host: { properties: { "class.mat-app-background": "true" } }, usesInheritance: true, ngImport: i0, template: "<ng-template #cancelBtnDefault>\n\t<button mat-button\n\t\t\t[color]=\"color\">CANCEL\n\t</button>\n</ng-template>\n<ng-template #confirmBtnDefault>\n\t<button mat-button\n\t\t\t[color]=\"color\">OK\n\t</button>\n</ng-template>\n<div cdkTrapFocus>\n\t<ngx-mat-timepicker-content [appendToInput]=\"data.appendToInput\"\n\t\t\t\t\t\t\t\t[inputElement]=\"data.inputElement\">\n\t\t<div class=\"timepicker\"\n\t\t\t [ngClass]=\"data.timepickerClass\">\n\t\t\t<mat-toolbar [color]=\"color\"\n\t\t\t\t\t\t [class.is-editable]=\"data.enableKeyboardInput\"\n\t\t\t\t\t\t class=\"timepicker-header\">\n\t\t\t\t<ngx-mat-timepicker-dial [color]=\"color\"\n\t\t\t\t\t\t\t\t\t\t [format]=\"data.format\"\n\t\t\t\t\t\t\t\t\t\t [hour]=\"(selectedHour | async)?.time\"\n\t\t\t\t\t\t\t\t\t\t [minute]=\"(selectedMinute | async)?.time\"\n\t\t\t\t\t\t\t\t\t\t [period]=\"selectedPeriod | async\"\n\t\t\t\t\t\t\t\t\t\t [activeTimeUnit]=\"activeTimeUnit\"\n\t\t\t\t\t\t\t\t\t\t [minTime]=\"data.minTime\"\n\t\t\t\t\t\t\t\t\t\t [maxTime]=\"data.maxTime\"\n\t\t\t\t\t\t\t\t\t\t [isEditable]=\"data.enableKeyboardInput\"\n\t\t\t\t\t\t\t\t\t\t [editableHintTmpl]=\"data.editableHintTmpl\"\n\t\t\t\t\t\t\t\t\t\t [minutesGap]=\"data.minutesGap\"\n\t\t\t\t\t\t\t\t\t\t [hoursOnly]=\"data.hoursOnly\"\n\t\t\t\t\t\t\t\t\t\t (periodChanged)=\"changePeriod($event)\"\n\t\t\t\t\t\t\t\t\t\t (timeUnitChanged)=\"changeTimeUnit($event)\"\n\t\t\t\t\t\t\t\t\t\t (hourChanged)=\"onHourChange($event)\"\n\t\t\t\t\t\t\t\t\t\t (minuteChanged)=\"onMinuteChange($event)\">\n\t\t\t\t</ngx-mat-timepicker-dial>\n\t\t\t</mat-toolbar>\n\t\t\t<div class=\"timepicker__main-content\">\n\t\t\t\t<div class=\"timepicker__body\"\n\t\t\t\t\t [ngSwitch]=\"activeTimeUnit\">\n\t\t\t\t\t<div *ngSwitchCase=\"timeUnit.HOUR\">\n\t\t\t\t\t\t<ngx-mat-timepicker-24-hours-face *ngIf=\"data.format === 24;else ampmHours\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [color]=\"color\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  (hourChange)=\"onHourChange($event)\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [selectedHour]=\"selectedHour | async\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [minTime]=\"data.minTime\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [maxTime]=\"data.maxTime\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [format]=\"data.format\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  (hourSelected)=\"onHourSelected($event)\"></ngx-mat-timepicker-24-hours-face>\n\t\t\t\t\t\t<ng-template #ampmHours>\n\t\t\t\t\t\t\t<ngx-mat-timepicker-12-hours-face\n\t\t\t\t\t\t\t\t\t[color]=\"color\"\n\t\t\t\t\t\t\t\t\t(hourChange)=\"onHourChange($event)\"\n\t\t\t\t\t\t\t\t\t[selectedHour]=\"selectedHour | async\"\n\t\t\t\t\t\t\t\t\t[period]=\"selectedPeriod | async\"\n\t\t\t\t\t\t\t\t\t[minTime]=\"data.minTime\"\n\t\t\t\t\t\t\t\t\t[maxTime]=\"data.maxTime\"\n\t\t\t\t\t\t\t\t\t(hourSelected)=\"onHourSelected($event)\"></ngx-mat-timepicker-12-hours-face>\n\t\t\t\t\t\t</ng-template>\n\t\t\t\t\t</div>\n\t\t\t\t\t<ngx-mat-timepicker-minutes-face *ngSwitchCase=\"timeUnit.MINUTE\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [dottedMinutesInGap]=\"data.dottedMinutesInGap\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [color]=\"color\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [selectedMinute]=\"selectedMinute | async\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [selectedHour]=\"(selectedHour | async)?.time\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [minTime]=\"data.minTime\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [maxTime]=\"data.maxTime\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [format]=\"data.format\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [period]=\"selectedPeriod | async\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [minutesGap]=\"data.minutesGap\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t (minuteChange)=\"onMinuteChange($event)\"></ngx-mat-timepicker-minutes-face>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t</ngx-mat-timepicker-content>\n\n\t<div class=\"ngx-mat-timepicker-standalone-actions\">\n\t\t<div (click)=\"close()\">\n\t\t\t<ng-container\n\t\t\t\t\t*ngTemplateOutlet=\"data.cancelBtnTmpl ? data.cancelBtnTmpl : cancelBtnDefault\"></ng-container>\n\t\t</div>\n\t\t<div (click)=\"setTime()\">\n\t\t\t<ng-container\n\t\t\t\t\t*ngTemplateOutlet=\"data.confirmBtnTmpl ? data.confirmBtnTmpl : confirmBtnDefault\"></ng-container>\n\t\t</div>\n\t</div>\n</div>\n", styles: ["ngx-mat-timepicker-standalone{display:block;border-radius:4px;box-shadow:0 0 5px 2px #00000040;overflow:hidden}ngx-mat-timepicker-standalone ngx-mat-timepicker-content{display:block}ngx-mat-timepicker-standalone ngx-mat-timepicker-content mat-toolbar.timepicker-header{display:flex;justify-content:center;align-items:center}ngx-mat-timepicker-standalone ngx-mat-timepicker-content mat-toolbar.timepicker-header.is-editable{height:auto}ngx-mat-timepicker-standalone ngx-mat-timepicker-content .clock-face{margin:16px}ngx-mat-timepicker-standalone .ngx-mat-timepicker-standalone-actions{display:flex;flex-direction:row;justify-content:flex-end;padding:0 16px 16px}\n"], dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }, { kind: "ngmodule", type: A11yModule }, { kind: "directive", type: i5.CdkTrapFocus, selector: "[cdkTrapFocus]", inputs: ["cdkTrapFocus", "cdkTrapFocusAutoCapture"], exportAs: ["cdkTrapFocus"] }, { kind: "component", type: NgxMatTimepickerContentComponent, selector: "ngx-mat-timepicker-content", inputs: ["appendToInput", "inputElement"] }, { kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "ngmodule", type: MatToolbarModule }, { kind: "component", type: i6.MatToolbar, selector: "mat-toolbar", inputs: ["color"], exportAs: ["matToolbar"] }, { kind: "component", type: NgxMatTimepickerDialComponent, selector: "ngx-mat-timepicker-dial", inputs: ["activeTimeUnit", "color", "editableHintTmpl", "format", "hour", "hoursOnly", "isEditable", "maxTime", "minTime", "minute", "minutesGap", "period"], outputs: ["hourChanged", "minuteChanged", "periodChanged", "timeUnitChanged"] }, { kind: "directive", type: NgSwitch, selector: "[ngSwitch]", inputs: ["ngSwitch"] }, { kind: "directive", type: NgSwitchCase, selector: "[ngSwitchCase]", inputs: ["ngSwitchCase"] }, { kind: "directive", type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: NgxMatTimepicker24HoursFaceComponent, selector: "ngx-mat-timepicker-24-hours-face" }, { kind: "component", type: NgxMatTimepicker12HoursFaceComponent, selector: "ngx-mat-timepicker-12-hours-face", inputs: ["period"] }, { kind: "component", type: NgxMatTimepickerMinutesFaceComponent, selector: "ngx-mat-timepicker-minutes-face", inputs: ["color", "dottedMinutesInGap", "format", "maxTime", "minTime", "minutesGap", "period", "selectedHour", "selectedMinute"], outputs: ["minuteChange"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "pipe", type: AsyncPipe, name: "async" }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerStandaloneComponent, decorators: [{
            type: Component,
            args: [{ selector: "ngx-mat-timepicker-standalone", host: {
                        "[class.mat-app-background]": "true"
                    }, encapsulation: ViewEncapsulation.None, imports: [
                        MatButtonModule,
                        A11yModule,
                        NgxMatTimepickerContentComponent,
                        NgClass,
                        MatToolbarModule,
                        NgxMatTimepickerDialComponent,
                        NgSwitch,
                        NgSwitchCase,
                        NgIf,
                        NgxMatTimepicker24HoursFaceComponent,
                        NgxMatTimepicker12HoursFaceComponent,
                        NgxMatTimepickerMinutesFaceComponent,
                        NgTemplateOutlet,
                        AsyncPipe
                    ], template: "<ng-template #cancelBtnDefault>\n\t<button mat-button\n\t\t\t[color]=\"color\">CANCEL\n\t</button>\n</ng-template>\n<ng-template #confirmBtnDefault>\n\t<button mat-button\n\t\t\t[color]=\"color\">OK\n\t</button>\n</ng-template>\n<div cdkTrapFocus>\n\t<ngx-mat-timepicker-content [appendToInput]=\"data.appendToInput\"\n\t\t\t\t\t\t\t\t[inputElement]=\"data.inputElement\">\n\t\t<div class=\"timepicker\"\n\t\t\t [ngClass]=\"data.timepickerClass\">\n\t\t\t<mat-toolbar [color]=\"color\"\n\t\t\t\t\t\t [class.is-editable]=\"data.enableKeyboardInput\"\n\t\t\t\t\t\t class=\"timepicker-header\">\n\t\t\t\t<ngx-mat-timepicker-dial [color]=\"color\"\n\t\t\t\t\t\t\t\t\t\t [format]=\"data.format\"\n\t\t\t\t\t\t\t\t\t\t [hour]=\"(selectedHour | async)?.time\"\n\t\t\t\t\t\t\t\t\t\t [minute]=\"(selectedMinute | async)?.time\"\n\t\t\t\t\t\t\t\t\t\t [period]=\"selectedPeriod | async\"\n\t\t\t\t\t\t\t\t\t\t [activeTimeUnit]=\"activeTimeUnit\"\n\t\t\t\t\t\t\t\t\t\t [minTime]=\"data.minTime\"\n\t\t\t\t\t\t\t\t\t\t [maxTime]=\"data.maxTime\"\n\t\t\t\t\t\t\t\t\t\t [isEditable]=\"data.enableKeyboardInput\"\n\t\t\t\t\t\t\t\t\t\t [editableHintTmpl]=\"data.editableHintTmpl\"\n\t\t\t\t\t\t\t\t\t\t [minutesGap]=\"data.minutesGap\"\n\t\t\t\t\t\t\t\t\t\t [hoursOnly]=\"data.hoursOnly\"\n\t\t\t\t\t\t\t\t\t\t (periodChanged)=\"changePeriod($event)\"\n\t\t\t\t\t\t\t\t\t\t (timeUnitChanged)=\"changeTimeUnit($event)\"\n\t\t\t\t\t\t\t\t\t\t (hourChanged)=\"onHourChange($event)\"\n\t\t\t\t\t\t\t\t\t\t (minuteChanged)=\"onMinuteChange($event)\">\n\t\t\t\t</ngx-mat-timepicker-dial>\n\t\t\t</mat-toolbar>\n\t\t\t<div class=\"timepicker__main-content\">\n\t\t\t\t<div class=\"timepicker__body\"\n\t\t\t\t\t [ngSwitch]=\"activeTimeUnit\">\n\t\t\t\t\t<div *ngSwitchCase=\"timeUnit.HOUR\">\n\t\t\t\t\t\t<ngx-mat-timepicker-24-hours-face *ngIf=\"data.format === 24;else ampmHours\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [color]=\"color\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  (hourChange)=\"onHourChange($event)\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [selectedHour]=\"selectedHour | async\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [minTime]=\"data.minTime\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [maxTime]=\"data.maxTime\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  [format]=\"data.format\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t  (hourSelected)=\"onHourSelected($event)\"></ngx-mat-timepicker-24-hours-face>\n\t\t\t\t\t\t<ng-template #ampmHours>\n\t\t\t\t\t\t\t<ngx-mat-timepicker-12-hours-face\n\t\t\t\t\t\t\t\t\t[color]=\"color\"\n\t\t\t\t\t\t\t\t\t(hourChange)=\"onHourChange($event)\"\n\t\t\t\t\t\t\t\t\t[selectedHour]=\"selectedHour | async\"\n\t\t\t\t\t\t\t\t\t[period]=\"selectedPeriod | async\"\n\t\t\t\t\t\t\t\t\t[minTime]=\"data.minTime\"\n\t\t\t\t\t\t\t\t\t[maxTime]=\"data.maxTime\"\n\t\t\t\t\t\t\t\t\t(hourSelected)=\"onHourSelected($event)\"></ngx-mat-timepicker-12-hours-face>\n\t\t\t\t\t\t</ng-template>\n\t\t\t\t\t</div>\n\t\t\t\t\t<ngx-mat-timepicker-minutes-face *ngSwitchCase=\"timeUnit.MINUTE\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [dottedMinutesInGap]=\"data.dottedMinutesInGap\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [color]=\"color\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [selectedMinute]=\"selectedMinute | async\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [selectedHour]=\"(selectedHour | async)?.time\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [minTime]=\"data.minTime\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [maxTime]=\"data.maxTime\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [format]=\"data.format\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [period]=\"selectedPeriod | async\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t [minutesGap]=\"data.minutesGap\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t (minuteChange)=\"onMinuteChange($event)\"></ngx-mat-timepicker-minutes-face>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t</ngx-mat-timepicker-content>\n\n\t<div class=\"ngx-mat-timepicker-standalone-actions\">\n\t\t<div (click)=\"close()\">\n\t\t\t<ng-container\n\t\t\t\t\t*ngTemplateOutlet=\"data.cancelBtnTmpl ? data.cancelBtnTmpl : cancelBtnDefault\"></ng-container>\n\t\t</div>\n\t\t<div (click)=\"setTime()\">\n\t\t\t<ng-container\n\t\t\t\t\t*ngTemplateOutlet=\"data.confirmBtnTmpl ? data.confirmBtnTmpl : confirmBtnDefault\"></ng-container>\n\t\t</div>\n\t</div>\n</div>\n", styles: ["ngx-mat-timepicker-standalone{display:block;border-radius:4px;box-shadow:0 0 5px 2px #00000040;overflow:hidden}ngx-mat-timepicker-standalone ngx-mat-timepicker-content{display:block}ngx-mat-timepicker-standalone ngx-mat-timepicker-content mat-toolbar.timepicker-header{display:flex;justify-content:center;align-items:center}ngx-mat-timepicker-standalone ngx-mat-timepicker-content mat-toolbar.timepicker-header.is-editable{height:auto}ngx-mat-timepicker-standalone ngx-mat-timepicker-content .clock-face{margin:16px}ngx-mat-timepicker-standalone .ngx-mat-timepicker-standalone-actions{display:flex;flex-direction:row;justify-content:flex-end;padding:0 16px 16px}\n"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [NGX_MAT_TIMEPICKER_CONFIG]
                }] }, { type: NgxMatTimepickerService }, { type: NgxMatTimepickerEventService }, { type: NgxMatTimepickerLocaleService }] });

let config;
class NgxMatTimepickerProvider {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerProvider, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerProvider, isStandalone: true, selector: "ngx-mat-timepicker-provider", providers: [
            {
                provide: NGX_MAT_TIMEPICKER_CONFIG,
                useFactory() {
                    return config;
                }
            }
        ], ngImport: i0, template: `
		<ngx-mat-timepicker-standalone></ngx-mat-timepicker-standalone>`, isInline: true, dependencies: [{ kind: "component", type: NgxMatTimepickerStandaloneComponent, selector: "ngx-mat-timepicker-standalone" }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerProvider, decorators: [{
            type: Component,
            args: [{
                    selector: "ngx-mat-timepicker-provider",
                    template: `
		<ngx-mat-timepicker-standalone></ngx-mat-timepicker-standalone>`,
                    providers: [
                        {
                            provide: NGX_MAT_TIMEPICKER_CONFIG,
                            useFactory() {
                                return config;
                            }
                        }
                    ],
                    imports: [NgxMatTimepickerStandaloneComponent]
                }]
        }] });
class NgxMatTimepickerComponent {
    static { this.nextId = 0; }
    set appendToInput(newValue) {
        this._appendToInput = coerceBooleanProperty(newValue);
    }
    set color(newValue) {
        this._color = newValue;
    }
    get color() {
        return this._color;
    }
    get disabled() {
        return this._timepickerInput && this._timepickerInput.disabled;
    }
    set dottedMinutesInGap(newValue) {
        this._dottedMinutesInGap = coerceBooleanProperty(newValue);
    }
    get dottedMinutesInGap() {
        return this._dottedMinutesInGap;
    }
    set enableKeyboardInput(newValue) {
        this._enableKeyboardInput = coerceBooleanProperty(newValue);
    }
    get enableKeyboardInput() {
        return this._enableKeyboardInput;
    }
    get format() {
        return this._timepickerInput ? this._timepickerInput.format : this._format;
    }
    set format(value) {
        this._format = NgxMatTimepickerAdapter.isTwentyFour(value) ? 24 : 12;
    }
    get inputElement() {
        return this._timepickerInput && this._timepickerInput.element;
    }
    get maxTime() {
        return this._timepickerInput ? this._timepickerInput.max : this.max;
    }
    get minTime() {
        return this._timepickerInput ? this._timepickerInput.min : this.min;
    }
    get minutesGap() {
        return this._minutesGap;
    }
    set minutesGap(gap) {
        if (gap == null) {
            return;
        }
        gap = Math.floor(gap);
        this._minutesGap = gap <= 59 ? gap : 1;
    }
    get overlayOrigin() {
        return this._timepickerInput ? this._timepickerInput.cdkOverlayOrigin : void 0;
    }
    get time() {
        return this._timepickerInput && this._timepickerInput.value;
    }
    constructor(_dialog) {
        this._dialog = _dialog;
        this.closed = new EventEmitter();
        this.hourSelected = new EventEmitter();
        this.hoursOnly = false;
        this.id = `ngx_mat_timepicker_${++NgxMatTimepickerComponent.nextId}`;
        this.isEsc = !0;
        this.opened = new EventEmitter();
        this.overlayPositions = [
            {
                originX: "center",
                originY: "bottom",
                overlayX: "center",
                overlayY: "top",
                offsetY: 0
            },
            {
                originX: "center",
                originY: "top",
                overlayX: "center",
                overlayY: "bottom",
                offsetY: 0
            }
        ];
        this.showPicker = !1;
        this.timeChanged = new EventEmitter();
        this.timeSet = new EventEmitter();
        this.timeUpdated = new BehaviorSubject(void 0); // used in the dialog, check if a better approach can be used
        this._appendToInput = !1;
        this._color = "primary";
        this._dottedMinutesInGap = !1;
        this._enableKeyboardInput = !1;
        this._format = 12;
    }
    close() {
        if (this._appendToInput) {
            this._overlayRef && this._overlayRef.dispose();
        }
        else {
            this._dialogRef && this._dialogRef.close();
        }
        this.inputElement.focus(); // Fix ExpressionHasChangedAfterCheck error on overlay destroy
        this.showPicker = !1;
        this.closed.emit();
    }
    open() {
        // Set data to be injected
        config = {
            timepickerBaseRef: this,
            time: this.time,
            defaultTime: this.defaultTime,
            dottedMinutesInGap: this._dottedMinutesInGap,
            maxTime: this.maxTime,
            minTime: this.minTime,
            format: this.format,
            minutesGap: this.minutesGap,
            disableAnimation: this.disableAnimation,
            cancelBtnTmpl: this.cancelBtnTmpl,
            confirmBtnTmpl: this.confirmBtnTmpl,
            editableHintTmpl: this.editableHintTmpl,
            disabled: this.disabled,
            enableKeyboardInput: this.enableKeyboardInput,
            preventOverlayClick: this.preventOverlayClick,
            appendToInput: this._appendToInput,
            hoursOnly: this.hoursOnly,
            timepickerClass: this.timepickerClass,
            inputElement: this.inputElement,
            color: this.color
        };
        if (this._appendToInput) {
            this.showPicker = !0;
        }
        else {
            this._dialogRef = this._dialog.open(NgxMatTimepickerDialogComponent, {
                panelClass: "ngx-mat-timepicker-dialog",
                data: {
                    ...config
                }
            });
            this._dialogRef
                .afterClosed()
                .subscribe(() => {
                this.closed.emit();
            });
        }
        this.opened.emit();
    }
    /***
     * Register an input with this timepicker.
     * input - The timepicker input to register with this timepicker
     */
    registerInput(input) {
        if (this._timepickerInput) {
            console.warn("Input for this timepicker was already set", input.element);
            throw Error("A Timepicker can only be associated with a single input.");
        }
        this._timepickerInput = input;
    }
    unregisterInput() {
        this._timepickerInput = void 0;
    }
    updateTime(time) {
        this.timeUpdated.next(time);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerComponent, deps: [{ token: i1$2.MatDialog }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerComponent, isStandalone: true, selector: "ngx-mat-timepicker", inputs: { appendToInput: "appendToInput", color: "color", dottedMinutesInGap: "dottedMinutesInGap", enableKeyboardInput: "enableKeyboardInput", format: "format", minutesGap: "minutesGap", cancelBtnTmpl: "cancelBtnTmpl", confirmBtnTmpl: "confirmBtnTmpl", defaultTime: "defaultTime", disableAnimation: "disableAnimation", editableHintTmpl: "editableHintTmpl", hoursOnly: "hoursOnly", isEsc: "isEsc", max: "max", min: "min", preventOverlayClick: "preventOverlayClick", timepickerClass: "timepickerClass" }, outputs: { closed: "closed", hourSelected: "hourSelected", opened: "opened", timeChanged: "timeChanged", timeSet: "timeSet" }, host: { properties: { "id": "this.id" } }, ngImport: i0, template: `
		<ng-template
				cdkConnectedOverlay
				[cdkConnectedOverlayPositions]="overlayPositions"
				[cdkConnectedOverlayHasBackdrop]="!0"
				cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
				(backdropClick)="close()"
				[cdkConnectedOverlayOrigin]="overlayOrigin"
				[cdkConnectedOverlayOpen]="showPicker">
			<ngx-mat-timepicker-provider></ngx-mat-timepicker-provider>
		</ng-template>
    `, isInline: true, dependencies: [{ kind: "directive", type: CdkConnectedOverlay, selector: "[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]", inputs: ["cdkConnectedOverlayOrigin", "cdkConnectedOverlayPositions", "cdkConnectedOverlayPositionStrategy", "cdkConnectedOverlayOffsetX", "cdkConnectedOverlayOffsetY", "cdkConnectedOverlayWidth", "cdkConnectedOverlayHeight", "cdkConnectedOverlayMinWidth", "cdkConnectedOverlayMinHeight", "cdkConnectedOverlayBackdropClass", "cdkConnectedOverlayPanelClass", "cdkConnectedOverlayViewportMargin", "cdkConnectedOverlayScrollStrategy", "cdkConnectedOverlayOpen", "cdkConnectedOverlayDisableClose", "cdkConnectedOverlayTransformOriginOn", "cdkConnectedOverlayHasBackdrop", "cdkConnectedOverlayLockPosition", "cdkConnectedOverlayFlexibleDimensions", "cdkConnectedOverlayGrowAfterOpen", "cdkConnectedOverlayPush", "cdkConnectedOverlayDisposeOnNavigation"], outputs: ["backdropClick", "positionChange", "attach", "detach", "overlayKeydown", "overlayOutsideClick"], exportAs: ["cdkConnectedOverlay"] }, { kind: "component", type: NgxMatTimepickerProvider, selector: "ngx-mat-timepicker-provider" }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: "ngx-mat-timepicker",
                    template: `
		<ng-template
				cdkConnectedOverlay
				[cdkConnectedOverlayPositions]="overlayPositions"
				[cdkConnectedOverlayHasBackdrop]="!0"
				cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
				(backdropClick)="close()"
				[cdkConnectedOverlayOrigin]="overlayOrigin"
				[cdkConnectedOverlayOpen]="showPicker">
			<ngx-mat-timepicker-provider></ngx-mat-timepicker-provider>
		</ng-template>
    `,
                    imports: [CdkConnectedOverlay, NgxMatTimepickerStandaloneComponent, NgxMatTimepickerProvider]
                }]
        }], ctorParameters: () => [{ type: i1$2.MatDialog }], propDecorators: { appendToInput: [{
                type: Input
            }], color: [{
                type: Input
            }], dottedMinutesInGap: [{
                type: Input
            }], enableKeyboardInput: [{
                type: Input
            }], format: [{
                type: Input
            }], minutesGap: [{
                type: Input
            }], cancelBtnTmpl: [{
                type: Input
            }], closed: [{
                type: Output
            }], confirmBtnTmpl: [{
                type: Input
            }], defaultTime: [{
                type: Input
            }], disableAnimation: [{
                type: Input
            }], editableHintTmpl: [{
                type: Input
            }], hourSelected: [{
                type: Output
            }], hoursOnly: [{
                type: Input
            }], id: [{
                type: HostBinding,
                args: ["id"]
            }], isEsc: [{
                type: Input
            }], max: [{
                type: Input
            }], min: [{
                type: Input
            }], opened: [{
                type: Output
            }], preventOverlayClick: [{
                type: Input
            }], timeChanged: [{
                type: Output
            }], timepickerClass: [{
                type: Input
            }], timeSet: [{
                type: Output
            }] } });

/* To override a default toggle icon */
class NgxMatTimepickerToggleIconDirective {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerToggleIconDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerToggleIconDirective, isStandalone: true, selector: "[ngxMatTimepickerToggleIcon]", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerToggleIconDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: "[ngxMatTimepickerToggleIcon]",
                    standalone: true
                }]
        }] });

class NgxMatTimepickerToggleComponent {
    get disabled() {
        return this._disabled === void 0 ? this.timepicker?.disabled : this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
    }
    open(event) {
        if (this.timepicker) {
            this.timepicker.open();
            event.stopPropagation();
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerToggleComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerToggleComponent, isStandalone: true, selector: "ngx-mat-timepicker-toggle", inputs: { disabled: "disabled", timepicker: ["for", "timepicker"] }, queries: [{ propertyName: "customIcon", first: true, predicate: NgxMatTimepickerToggleIconDirective, descendants: true, static: true }], ngImport: i0, template: "<button class=\"ngx-mat-timepicker-toggle mat-elevation-z0\"\n        color=\"\"\n        mat-icon-button\n        (click)=\"open($event)\"\n        [disabled]=\"disabled\"\n        type=\"button\">\n    <svg xmlns=\"http://www.w3.org/2000/svg\"\n         class=\"ngx-mat-timepicker-toggle-default-icon\"\n         fill=\"currentColor\"\n         viewBox=\"0 0 24 24\"\n         width=\"24px\"\n         height=\"24px\"\n         *ngIf=\"!customIcon\">\n        <path d=\"M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003                   6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 6 L 11 12.414062 L 15.292969 16.707031 L 16.707031 15.292969 L 13 11.585938 L 13 6 L 11 6 z\" />\n    </svg>\n\n    <ng-content select=\"[ngxMatTimepickerToggleIcon]\"></ng-content>\n</button>\n", styles: ["button.ngx-mat-timepicker-toggle{background-color:transparent;text-align:center;-webkit-user-select:none;user-select:none;cursor:pointer;box-shadow:none}.mat-form-field .ngx-mat-timepicker-toggle-default-icon{margin:auto}.mat-form-field .ngx-mat-timepicker-toggle-default-icon{display:block;width:1.5em;height:1.5em}body .ngx-mat-timepicker-toggle{color:#0000008a}\n"], dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button]", exportAs: ["matButton"] }, { kind: "directive", type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerToggleComponent, decorators: [{
            type: Component,
            args: [{ selector: "ngx-mat-timepicker-toggle", encapsulation: ViewEncapsulation.None, imports: [MatButtonModule, NgIf], template: "<button class=\"ngx-mat-timepicker-toggle mat-elevation-z0\"\n        color=\"\"\n        mat-icon-button\n        (click)=\"open($event)\"\n        [disabled]=\"disabled\"\n        type=\"button\">\n    <svg xmlns=\"http://www.w3.org/2000/svg\"\n         class=\"ngx-mat-timepicker-toggle-default-icon\"\n         fill=\"currentColor\"\n         viewBox=\"0 0 24 24\"\n         width=\"24px\"\n         height=\"24px\"\n         *ngIf=\"!customIcon\">\n        <path d=\"M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003                   6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 6 L 11 12.414062 L 15.292969 16.707031 L 16.707031 15.292969 L 13 11.585938 L 13 6 L 11 6 z\" />\n    </svg>\n\n    <ng-content select=\"[ngxMatTimepickerToggleIcon]\"></ng-content>\n</button>\n", styles: ["button.ngx-mat-timepicker-toggle{background-color:transparent;text-align:center;-webkit-user-select:none;user-select:none;cursor:pointer;box-shadow:none}.mat-form-field .ngx-mat-timepicker-toggle-default-icon{margin:auto}.mat-form-field .ngx-mat-timepicker-toggle-default-icon{display:block;width:1.5em;height:1.5em}body .ngx-mat-timepicker-toggle{color:#0000008a}\n"] }]
        }], propDecorators: { disabled: [{
                type: Input
            }], customIcon: [{
                type: ContentChild,
                args: [NgxMatTimepickerToggleIconDirective, { static: true }]
            }], timepicker: [{
                type: Input,
                args: ["for"]
            }] } });

function concatTime(currentTime, nextTime) {
    const isNumber = /\d/.test(nextTime);
    if (isNumber) {
        const time = currentTime + nextTime;
        return +time;
    }
    return undefined;
}
class NgxMatTimepickerControlComponent {
    static { this.nextId = 0; }
    set color(newValue) {
        this._color = newValue;
    }
    get color() {
        return this._color;
    }
    set floatLabel(newValue) {
        this._floatLabel = newValue;
    }
    get floatLabel() {
        return this._floatLabel;
    }
    constructor(_timeParser) {
        this._timeParser = _timeParser;
        this.id = NgxMatTimepickerControlComponent.nextId++;
        this.timeChanged = new EventEmitter();
        this._color = "primary";
        this._floatLabel = "auto";
    }
    changeTime(event) {
        event.stopPropagation();
        const char = event.data;
        const time = concatTime(String(this.time), char);
        this._changeTimeIfValid(time);
    }
    decrease() {
        if (!this.disabled) {
            let previousTime = +this.time - 1;
            if (previousTime < this.min) {
                previousTime = this.max;
            }
            if (this._isSelectedTimeDisabled(previousTime)) {
                previousTime = this._getAvailableTime(previousTime, this._getPrevAvailableTime.bind(this));
            }
            if (previousTime !== this.time) {
                this.timeChanged.emit(previousTime);
            }
        }
    }
    increase() {
        if (!this.disabled) {
            let nextTime = +this.time + 1;
            if (nextTime > this.max) {
                nextTime = this.min;
            }
            if (this._isSelectedTimeDisabled(nextTime)) {
                nextTime = this._getAvailableTime(nextTime, this._getNextAvailableTime.bind(this));
            }
            if (nextTime !== this.time) {
                this.timeChanged.emit(nextTime);
            }
        }
    }
    ngOnChanges(changes) {
        // tslint:disable-next-line:no-string-literal
        if (changes["timeList"] && this.time != null) {
            if (this._isSelectedTimeDisabled(this.time)) {
                this._setAvailableTime();
            }
        }
    }
    onBlur() {
        this.isFocused = false;
        if (this._previousTime !== this.time) {
            this._changeTimeIfValid(+this.time);
        }
    }
    onFocus() {
        this.isFocused = true;
        this._previousTime = this.time;
    }
    onKeydown(event) {
        event.stopPropagation();
        if (!NgxMatTimepickerUtils.isDigit(event)) {
            event.preventDefault();
        }
        switch (event.key) {
            case "ArrowUp":
                this.increase();
                break;
            case "ArrowDown":
                this.decrease();
                break;
        }
        if (this.preventTyping && event.key !== "Tab") {
            event.preventDefault();
        }
    }
    onModelChange(value) {
        this.time = +this._timeParser.transform(value, this.timeUnit);
    }
    _changeTimeIfValid(value) {
        if (!isNaN(value)) {
            this.time = value;
            if (this.time > this.max) {
                const timeString = String(value);
                this.time = +timeString[timeString.length - 1];
            }
            if (this.time < this.min) {
                this.time = this.min;
            }
            this.timeChanged.emit(this.time);
        }
    }
    _getAvailableTime(currentTime, fn) {
        const currentTimeIndex = this.timeList.findIndex(time => time.time === currentTime);
        const availableTime = fn(currentTimeIndex);
        return availableTime != null ? availableTime : this.time;
    }
    _getNextAvailableTime(index) {
        const timeCollection = this.timeList;
        const maxValue = timeCollection.length;
        for (let i = index + 1; i < maxValue; i++) {
            const time = timeCollection[i];
            if (!time.disabled) {
                return time.time;
            }
        }
        return undefined;
    }
    _getPrevAvailableTime(index) {
        for (let i = index; i >= 0; i--) {
            const time = this.timeList[i];
            if (!time.disabled) {
                return time.time;
            }
        }
        return undefined;
    }
    _isSelectedTimeDisabled(time) {
        return this.timeList.find((faceTime) => faceTime.time === time).disabled;
    }
    _setAvailableTime() {
        this.time = this.timeList.find(t => !t.disabled).time;
        this.timeChanged.emit(this.time);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerControlComponent, deps: [{ token: NgxMatTimepickerParserPipe }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerControlComponent, isStandalone: true, selector: "ngx-mat-timepicker-time-control", inputs: { color: "color", disabled: "disabled", floatLabel: "floatLabel", max: "max", min: "min", placeholder: "placeholder", preventTyping: "preventTyping", time: "time", timeList: "timeList", timeUnit: "timeUnit" }, outputs: { timeChanged: "timeChanged" }, providers: [NgxMatTimepickerParserPipe], usesOnChanges: true, ngImport: i0, template: "<mat-form-field [color]=\"color\"\n                [floatLabel]=\"floatLabel\"\n                [ngClass]=\"{'active': isFocused}\"\n                class=\"ngx-mat-timepicker-control\">\n    <input id=\"ngx_mat_timepicker_field_{{id}}\"\n           name=\"ngx_mat_timepicker_field_{{id}}\"\n           matInput\n           maxlength=\"2\"\n           [ngModel]=\"time | ngxMatTimepickerParser: timeUnit | timeLocalizer: timeUnit : true\"\n           (ngModelChange)=\"onModelChange($event)\"\n           [placeholder]=\"placeholder\"\n           [disabled]=\"disabled\"\n           (keydown)=\"onKeydown($event)\"\n           (beforeinput)=\"changeTime($event)\"\n           (focus)=\"onFocus()\"\n           (blur)=\"onBlur()\" />\n    <div class=\"arrows-wrap\"\n         matSuffix>\n        <span class=\"arrow\"\n              role=\"button\"\n              (click)=\"increase()\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\"\n                 height=\"18\"\n                 viewBox=\"0 0 24 24\"\n                 width=\"18\">\n                <path d=\"M0 0h24v24H0z\"\n                      fill=\"none\" />\n                <path d=\"M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z\" />\n            </svg>\n        </span>\n        <span class=\"arrow\"\n              role=\"button\"\n              (click)=\"decrease()\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\"\n                 height=\"18\"\n                 viewBox=\"0 0 24 24\"\n                 width=\"18\">\n                <path d=\"M0 0h24v24H0V0z\"\n                      fill=\"none\" />\n                <path d=\"M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z\" />\n            </svg>\n        </span>\n    </div>\n</mat-form-field>\n", styles: [".ngx-mat-timepicker-control{width:60px;min-width:60px}.ngx-mat-timepicker-control .arrows-wrap{position:relative;z-index:1}.ngx-mat-timepicker-control .arrows-wrap>.arrow{text-align:center;opacity:.5;height:15px;cursor:pointer;transition:opacity .2s;-webkit-user-select:none;user-select:none}.ngx-mat-timepicker-control .arrows-wrap>.arrow:hover{opacity:1}\n"], dependencies: [{ kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i2.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i2.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i3.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i4.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i4.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i4.MaxLengthValidator, selector: "[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]", inputs: ["maxlength"] }, { kind: "directive", type: i4.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "pipe", type: NgxMatTimepickerParserPipe, name: "ngxMatTimepickerParser" }, { kind: "pipe", type: NgxMatTimepickerTimeLocalizerPipe, name: "timeLocalizer" }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerControlComponent, decorators: [{
            type: Component,
            args: [{ selector: "ngx-mat-timepicker-time-control", changeDetection: ChangeDetectionStrategy.OnPush, providers: [NgxMatTimepickerParserPipe], imports: [MatFormFieldModule, NgClass, MatInputModule, FormsModule, NgxMatTimepickerParserPipe, NgxMatTimepickerTimeLocalizerPipe], template: "<mat-form-field [color]=\"color\"\n                [floatLabel]=\"floatLabel\"\n                [ngClass]=\"{'active': isFocused}\"\n                class=\"ngx-mat-timepicker-control\">\n    <input id=\"ngx_mat_timepicker_field_{{id}}\"\n           name=\"ngx_mat_timepicker_field_{{id}}\"\n           matInput\n           maxlength=\"2\"\n           [ngModel]=\"time | ngxMatTimepickerParser: timeUnit | timeLocalizer: timeUnit : true\"\n           (ngModelChange)=\"onModelChange($event)\"\n           [placeholder]=\"placeholder\"\n           [disabled]=\"disabled\"\n           (keydown)=\"onKeydown($event)\"\n           (beforeinput)=\"changeTime($event)\"\n           (focus)=\"onFocus()\"\n           (blur)=\"onBlur()\" />\n    <div class=\"arrows-wrap\"\n         matSuffix>\n        <span class=\"arrow\"\n              role=\"button\"\n              (click)=\"increase()\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\"\n                 height=\"18\"\n                 viewBox=\"0 0 24 24\"\n                 width=\"18\">\n                <path d=\"M0 0h24v24H0z\"\n                      fill=\"none\" />\n                <path d=\"M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z\" />\n            </svg>\n        </span>\n        <span class=\"arrow\"\n              role=\"button\"\n              (click)=\"decrease()\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\"\n                 height=\"18\"\n                 viewBox=\"0 0 24 24\"\n                 width=\"18\">\n                <path d=\"M0 0h24v24H0V0z\"\n                      fill=\"none\" />\n                <path d=\"M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z\" />\n            </svg>\n        </span>\n    </div>\n</mat-form-field>\n", styles: [".ngx-mat-timepicker-control{width:60px;min-width:60px}.ngx-mat-timepicker-control .arrows-wrap{position:relative;z-index:1}.ngx-mat-timepicker-control .arrows-wrap>.arrow{text-align:center;opacity:.5;height:15px;cursor:pointer;transition:opacity .2s;-webkit-user-select:none;user-select:none}.ngx-mat-timepicker-control .arrows-wrap>.arrow:hover{opacity:1}\n"] }]
        }], ctorParameters: () => [{ type: NgxMatTimepickerParserPipe }], propDecorators: { color: [{
                type: Input
            }], disabled: [{
                type: Input
            }], floatLabel: [{
                type: Input
            }], max: [{
                type: Input
            }], min: [{
                type: Input
            }], placeholder: [{
                type: Input
            }], preventTyping: [{
                type: Input
            }], time: [{
                type: Input
            }], timeChanged: [{
                type: Output
            }], timeList: [{
                type: Input
            }], timeUnit: [{
                type: Input
            }] } });

class NgxMatTimepickerFieldComponent {
    get color() {
        return this._color;
    }
    set color(newValue) {
        this._color = newValue;
    }
    get defaultTime() {
        return this._defaultTime;
    }
    set defaultTime(val) {
        this._defaultTime = val;
        this._isDefaultTime = !!val;
    }
    get floatLabel() {
        return this._floatLabel;
    }
    set floatLabel(newValue) {
        this._floatLabel = newValue;
    }
    get format() {
        return this._format;
    }
    set format(value) {
        if (NgxMatTimepickerAdapter.isTwentyFour(value)) {
            this._format = 24;
            this.minHour = 0;
            this.maxHour = 23;
        }
        else {
            this._format = 12;
            this.minHour = 1;
            this.maxHour = 12;
        }
        this.hoursList = NgxMatTimepickerUtils.getHours(this._format);
        const isDynamicallyChanged = value && (this._previousFormat && this._previousFormat !== this._format);
        if (isDynamicallyChanged) {
            this._updateTime(this.timepickerTime);
        }
        this._previousFormat = this._format;
    }
    get max() {
        return this._max;
    }
    set max(value) {
        if (typeof value === "string") {
            this._max = NgxMatTimepickerAdapter.parseTime(value, { locale: this._locale, format: this.format });
            return;
        }
        this._max = value;
    }
    get min() {
        return this._min;
    }
    set min(value) {
        if (typeof value === "string") {
            this._min = NgxMatTimepickerAdapter.parseTime(value, { locale: this._locale, format: this.format });
            return;
        }
        this._min = value;
    }
    get _locale() {
        return this._timepickerLocaleSrv.locale;
    }
    constructor(_timepickerService, _timepickerLocaleSrv) {
        this._timepickerService = _timepickerService;
        this._timepickerLocaleSrv = _timepickerLocaleSrv;
        this.hour$ = new BehaviorSubject(void 0);
        this.maxHour = 12;
        this.minHour = 1;
        this.minute$ = new BehaviorSubject(void 0);
        this.period = NgxMatTimepickerPeriods.AM;
        this.periods = [
            NgxMatTimepickerPeriods.AM,
            NgxMatTimepickerPeriods.PM
        ];
        this.timeChanged = new EventEmitter();
        this.timeUnit = NgxMatTimepickerUnits;
        this._color = "primary";
        this._floatLabel = "auto";
        this._format = 12;
        this._isFirstTimeChange = true;
        this._subsCtrl$ = new Subject();
        this._onChange = () => {
        };
        this._onTouched = () => {
        };
    }
    changeHour(hour) {
        this._timepickerService.hour = this.hoursList.find(h => h.time === hour);
        this._changeTime();
    }
    changeMinute(minute) {
        this._timepickerService.minute = this.minutesList.find(m => m.time === minute);
        this._changeTime();
    }
    changePeriod(event) {
        this._timepickerService.period = event.value;
        this._changeTime();
    }
    ngOnDestroy() {
        this._subsCtrl$.next();
        this._subsCtrl$.complete();
    }
    ngOnInit() {
        this._initTime(this.defaultTime);
        this.hoursList = NgxMatTimepickerUtils.getHours(this._format);
        this.minutesList = NgxMatTimepickerUtils.getMinutes();
        this.isTimeRangeSet = !!(this.min || this.max);
        this._timepickerService.selectedHour.pipe(tap((clockTime) => this._selectedHour = clockTime?.time), map(this._changeDefaultTimeValue.bind(this)), tap(() => this.isTimeRangeSet && this._updateAvailableMinutes()))
            .subscribe({
            next: (v) => this.hour$.next(v)
        });
        this._timepickerService.selectedMinute.pipe(map(this._changeDefaultTimeValue.bind(this)), tap(() => this._isFirstTimeChange = false))
            .subscribe({
            next: (v) => this.minute$.next(v)
        });
        // Selected period can only change when format is 12
        if (this.format === 12) {
            this._timepickerService.selectedPeriod.pipe(distinctUntilChanged(), tap((period) => this.period = period), tap(period => this.isChangePeriodDisabled = this._isPeriodDisabled(period)), takeUntil(this._subsCtrl$)).subscribe(() => this.isTimeRangeSet && this._updateAvailableTime());
        }
        else {
            // But we still need to run this once :) see #108
            this.isTimeRangeSet && this._updateAvailableTime();
        }
    }
    onTimeSet(time) {
        this._updateTime(time);
        this._emitLocalTimeChange(time);
    }
    registerOnChange(fn) {
        this._onChange = fn;
    }
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    writeValue(val) {
        if (val) {
            this._initTime(val);
        }
        else {
            this._resetTime();
        }
    }
    _changeDefaultTimeValue(clockFaceTime) {
        if (!this._isDefaultTime && this._isFirstTimeChange) {
            return { ...clockFaceTime, time: null };
        }
        return clockFaceTime;
    }
    _changeTime() {
        if (!isNaN(this.hour$.getValue()?.time) && !isNaN(this.minute$.getValue()?.time)) {
            const time = this._timepickerService.getFullTime(this.format);
            this.timepickerTime = time;
            this._emitLocalTimeChange(time);
        }
    }
    _emitLocalTimeChange(time) {
        const localTime = NgxMatTimepickerAdapter.toLocaleTimeString(time, { format: this.format, locale: this._locale });
        this._onChange(localTime);
        this._onTouched(localTime);
        this.timeChanged.emit(localTime);
    }
    _initTime(time) {
        const isDefaultTimeAvailable = NgxMatTimepickerAdapter
            .isTimeAvailable(time, this.min, this.max, "minutes", null, this.format);
        if (!isDefaultTimeAvailable) {
            if (this.min) {
                this._updateTime(NgxMatTimepickerAdapter.fromDateTimeToString(this.min, this.format));
                return;
            }
            if (this.max) {
                this._updateTime(NgxMatTimepickerAdapter.fromDateTimeToString(this.max, this.format));
                return;
            }
        }
        this._updateTime(time);
    }
    _isPeriodDisabled(period) {
        return NgxMatTimepickerUtils.disableHours(NgxMatTimepickerUtils.getHours(12), {
            min: this.min,
            max: this.max,
            format: 12,
            period: period === NgxMatTimepickerPeriods.AM ? NgxMatTimepickerPeriods.PM : NgxMatTimepickerPeriods.AM
        }).every(time => time.disabled);
    }
    _resetTime() {
        this._timepickerService.hour = { angle: 0, time: null };
        this._timepickerService.minute = { angle: 0, time: null };
    }
    _updateAvailableHours() {
        this.hoursList = NgxMatTimepickerUtils.disableHours(this.hoursList, {
            min: this.min,
            max: this.max,
            format: this.format,
            period: this.period
        });
    }
    _updateAvailableMinutes() {
        this.minutesList = NgxMatTimepickerUtils.disableMinutes(this.minutesList, this._selectedHour, {
            min: this.min,
            max: this.max,
            format: this.format,
            period: this.period
        });
    }
    _updateAvailableTime() {
        this._updateAvailableHours();
        if (this._selectedHour) {
            this._updateAvailableMinutes();
        }
    }
    _updateTime(time) {
        if (time) {
            const formattedTime = NgxMatTimepickerAdapter.formatTime(time, { locale: this._locale, format: this.format });
            this._timepickerService.setDefaultTimeIfAvailable(formattedTime, this.min, this.max, this.format);
            this.timepickerTime = formattedTime;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerFieldComponent, deps: [{ token: NgxMatTimepickerService }, { token: NgxMatTimepickerLocaleService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerFieldComponent, isStandalone: true, selector: "ngx-mat-timepicker-field", inputs: { color: "color", defaultTime: "defaultTime", floatLabel: "floatLabel", format: "format", max: "max", min: "min", cancelBtnTmpl: "cancelBtnTmpl", confirmBtnTmpl: "confirmBtnTmpl", controlOnly: "controlOnly", disabled: "disabled", toggleIcon: "toggleIcon" }, outputs: { timeChanged: "timeChanged" }, providers: [
            NgxMatTimepickerService,
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: NgxMatTimepickerFieldComponent,
                multi: true
            }
        ], ngImport: i0, template: "<div class=\"ngx-mat-timepicker\"\n     [ngClass]=\"{'ngx-mat-timepicker--disabled': disabled}\">\n    <ngx-mat-timepicker-time-control\n            class=\"ngx-mat-timepicker__control--first\"\n            [color]=\"color\"\n            [floatLabel]=\"floatLabel\"\n            [placeholder]=\"'HH'\"\n            [time]=\"hour$.getValue()?.time\"\n            [min]=\"minHour\"\n            [max]=\"maxHour\"\n            [timeUnit]=\"timeUnit.HOUR\"\n            [disabled]=\"disabled\"\n            [timeList]=\"hoursList\"\n            [preventTyping]=\"isTimeRangeSet\"\n            (timeChanged)=\"changeHour($event)\"></ngx-mat-timepicker-time-control>\n    <span class=\"separator-colon ngx-mat-timepicker__control--second\">:</span>\n    <ngx-mat-timepicker-time-control\n            class=\"ngx-mat-timepicker__control--third\"\n            [color]=\"color\"\n            [floatLabel]=\"floatLabel\"\n            [placeholder]=\"'MM'\"\n            [time]=\"minute$.getValue()?.time\"\n            [min]=\"0\"\n            [max]=\"59\"\n            [timeUnit]=\"timeUnit.MINUTE\"\n            [disabled]=\"disabled\"\n            [timeList]=\"minutesList\"\n            [preventTyping]=\"isTimeRangeSet\"\n            (timeChanged)=\"changeMinute($event)\"></ngx-mat-timepicker-time-control>\n    <mat-form-field class=\"period-select ngx-mat-timepicker__control--forth\"\n                    *ngIf=\"format !== 24\"\n                    [color]=\"color\">\n        <mat-select [disabled]=\"disabled || isChangePeriodDisabled\"\n                    (selectionChange)=\"changePeriod($event)\"\n                    [ngModel]=\"period\">\n            <mat-option *ngFor=\"let option of periods\"\n                        [value]=\"option\">{{option}}</mat-option>\n        </mat-select>\n    </mat-form-field>\n    <ngx-mat-timepicker-toggle\n            class=\"ngx-mat-timepicker__toggle\"\n            *ngIf=\"!controlOnly\"\n            [for]=\"timepicker\"\n            [disabled]=\"disabled\">\n        <span ngxMatTimepickerToggleIcon>\n            <ng-container *ngTemplateOutlet=\"toggleIcon || defaultIcon\"></ng-container>\n        </span>\n    </ngx-mat-timepicker-toggle>\n</div>\n<ngx-mat-timepicker\n        [color]=\"color\"\n        [min]=\"min\"\n        [max]=\"max\"\n        [defaultTime]=\"timepickerTime\"\n        [format]=\"format\"\n        [cancelBtnTmpl]=\"cancelBtnTmpl\"\n        [confirmBtnTmpl]=\"confirmBtnTmpl\"\n        (timeSet)=\"onTimeSet($event)\"\n        #timepicker></ngx-mat-timepicker>\n\n<ng-template #defaultIcon>\n    <mat-icon>watch_later</mat-icon>\n</ng-template>\n", styles: [".ngx-mat-timepicker{display:flex;align-items:center;height:100%}.ngx-mat-timepicker--disabled{background:#00000012;pointer-events:none}.ngx-mat-timepicker .separator-colon{margin-left:5px;margin-right:5px}.ngx-mat-timepicker .period-select{width:60px;min-width:60px;margin-left:8px;text-align:center}.ngx-mat-timepicker__control--first{order:1}.ngx-mat-timepicker__control--second{order:2}.ngx-mat-timepicker__control--third{order:3}.ngx-mat-timepicker__control--forth{order:4}.ngx-mat-timepicker__toggle{order:4;margin-bottom:1.5em;margin-left:4px}.ngx-mat-timepicker__toggle span.mat-button-wrapper{font-size:24px}\n"], dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "component", type: NgxMatTimepickerControlComponent, selector: "ngx-mat-timepicker-time-control", inputs: ["color", "disabled", "floatLabel", "max", "min", "placeholder", "preventTyping", "time", "timeList", "timeUnit"], outputs: ["timeChanged"] }, { kind: "directive", type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i2.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "ngmodule", type: MatSelectModule }, { kind: "component", type: i4$1.MatSelect, selector: "mat-select", inputs: ["aria-describedby", "panelClass", "disabled", "disableRipple", "tabIndex", "hideSingleSelectionIndicator", "placeholder", "required", "multiple", "disableOptionCentering", "compareWith", "value", "aria-label", "aria-labelledby", "errorStateMatcher", "typeaheadDebounceInterval", "sortComparator", "id", "panelWidth"], outputs: ["openedChange", "opened", "closed", "selectionChange", "valueChange"], exportAs: ["matSelect"] }, { kind: "component", type: i5$1.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i4.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i4.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: NgFor, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "ngmodule", type: MatOptionModule }, { kind: "component", type: NgxMatTimepickerToggleComponent, selector: "ngx-mat-timepicker-toggle", inputs: ["disabled", "for"] }, { kind: "directive", type: NgxMatTimepickerToggleIconDirective, selector: "[ngxMatTimepickerToggleIcon]" }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: NgxMatTimepickerComponent, selector: "ngx-mat-timepicker", inputs: ["appendToInput", "color", "dottedMinutesInGap", "enableKeyboardInput", "format", "minutesGap", "cancelBtnTmpl", "confirmBtnTmpl", "defaultTime", "disableAnimation", "editableHintTmpl", "hoursOnly", "isEsc", "max", "min", "preventOverlayClick", "timepickerClass"], outputs: ["closed", "hourSelected", "opened", "timeChanged", "timeSet"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i7.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerFieldComponent, decorators: [{
            type: Component,
            args: [{ selector: "ngx-mat-timepicker-field", providers: [
                        NgxMatTimepickerService,
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: NgxMatTimepickerFieldComponent,
                            multi: true
                        }
                    ], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, imports: [
                        NgClass,
                        NgxMatTimepickerControlComponent,
                        NgIf,
                        MatFormFieldModule,
                        MatSelectModule,
                        FormsModule,
                        NgFor,
                        MatOptionModule,
                        NgxMatTimepickerToggleComponent,
                        NgxMatTimepickerToggleIconDirective,
                        NgTemplateOutlet,
                        NgxMatTimepickerComponent,
                        MatIconModule
                    ], template: "<div class=\"ngx-mat-timepicker\"\n     [ngClass]=\"{'ngx-mat-timepicker--disabled': disabled}\">\n    <ngx-mat-timepicker-time-control\n            class=\"ngx-mat-timepicker__control--first\"\n            [color]=\"color\"\n            [floatLabel]=\"floatLabel\"\n            [placeholder]=\"'HH'\"\n            [time]=\"hour$.getValue()?.time\"\n            [min]=\"minHour\"\n            [max]=\"maxHour\"\n            [timeUnit]=\"timeUnit.HOUR\"\n            [disabled]=\"disabled\"\n            [timeList]=\"hoursList\"\n            [preventTyping]=\"isTimeRangeSet\"\n            (timeChanged)=\"changeHour($event)\"></ngx-mat-timepicker-time-control>\n    <span class=\"separator-colon ngx-mat-timepicker__control--second\">:</span>\n    <ngx-mat-timepicker-time-control\n            class=\"ngx-mat-timepicker__control--third\"\n            [color]=\"color\"\n            [floatLabel]=\"floatLabel\"\n            [placeholder]=\"'MM'\"\n            [time]=\"minute$.getValue()?.time\"\n            [min]=\"0\"\n            [max]=\"59\"\n            [timeUnit]=\"timeUnit.MINUTE\"\n            [disabled]=\"disabled\"\n            [timeList]=\"minutesList\"\n            [preventTyping]=\"isTimeRangeSet\"\n            (timeChanged)=\"changeMinute($event)\"></ngx-mat-timepicker-time-control>\n    <mat-form-field class=\"period-select ngx-mat-timepicker__control--forth\"\n                    *ngIf=\"format !== 24\"\n                    [color]=\"color\">\n        <mat-select [disabled]=\"disabled || isChangePeriodDisabled\"\n                    (selectionChange)=\"changePeriod($event)\"\n                    [ngModel]=\"period\">\n            <mat-option *ngFor=\"let option of periods\"\n                        [value]=\"option\">{{option}}</mat-option>\n        </mat-select>\n    </mat-form-field>\n    <ngx-mat-timepicker-toggle\n            class=\"ngx-mat-timepicker__toggle\"\n            *ngIf=\"!controlOnly\"\n            [for]=\"timepicker\"\n            [disabled]=\"disabled\">\n        <span ngxMatTimepickerToggleIcon>\n            <ng-container *ngTemplateOutlet=\"toggleIcon || defaultIcon\"></ng-container>\n        </span>\n    </ngx-mat-timepicker-toggle>\n</div>\n<ngx-mat-timepicker\n        [color]=\"color\"\n        [min]=\"min\"\n        [max]=\"max\"\n        [defaultTime]=\"timepickerTime\"\n        [format]=\"format\"\n        [cancelBtnTmpl]=\"cancelBtnTmpl\"\n        [confirmBtnTmpl]=\"confirmBtnTmpl\"\n        (timeSet)=\"onTimeSet($event)\"\n        #timepicker></ngx-mat-timepicker>\n\n<ng-template #defaultIcon>\n    <mat-icon>watch_later</mat-icon>\n</ng-template>\n", styles: [".ngx-mat-timepicker{display:flex;align-items:center;height:100%}.ngx-mat-timepicker--disabled{background:#00000012;pointer-events:none}.ngx-mat-timepicker .separator-colon{margin-left:5px;margin-right:5px}.ngx-mat-timepicker .period-select{width:60px;min-width:60px;margin-left:8px;text-align:center}.ngx-mat-timepicker__control--first{order:1}.ngx-mat-timepicker__control--second{order:2}.ngx-mat-timepicker__control--third{order:3}.ngx-mat-timepicker__control--forth{order:4}.ngx-mat-timepicker__toggle{order:4;margin-bottom:1.5em;margin-left:4px}.ngx-mat-timepicker__toggle span.mat-button-wrapper{font-size:24px}\n"] }]
        }], ctorParameters: () => [{ type: NgxMatTimepickerService }, { type: NgxMatTimepickerLocaleService }], propDecorators: { color: [{
                type: Input
            }], defaultTime: [{
                type: Input
            }], floatLabel: [{
                type: Input
            }], format: [{
                type: Input
            }], max: [{
                type: Input
            }], min: [{
                type: Input
            }], cancelBtnTmpl: [{
                type: Input
            }], confirmBtnTmpl: [{
                type: Input
            }], controlOnly: [{
                type: Input
            }], disabled: [{
                type: Input
            }], timeChanged: [{
                type: Output
            }], toggleIcon: [{
                type: Input
            }] } });

class NgxMatTimepickerDirective {
    get element() {
        return this._elementRef && this._elementRef.nativeElement;
    }
    get format() {
        return this._format;
    }
    set format(value) {
        this._format = NgxMatTimepickerAdapter.isTwentyFour(+value) ? 24 : 12;
        const isDynamicallyChanged = value && (this._previousFormat && this._previousFormat !== this._format);
        if (isDynamicallyChanged) {
            this.value = this._value;
            this._timepicker.updateTime(this._value);
        }
        this._previousFormat = this._format;
    }
    get max() {
        return this._max;
    }
    set max(value) {
        if (typeof value === "string") {
            this._max = NgxMatTimepickerAdapter.parseTime(value, { locale: this._locale, format: this.format });
            return;
        }
        this._max = value;
    }
    get min() {
        return this._min;
    }
    set min(value) {
        if (typeof value === "string") {
            this._min = NgxMatTimepickerAdapter.parseTime(value, { locale: this._locale, format: this.format });
            return;
        }
        this._min = value;
    }
    set timepicker(picker) {
        this._registerTimepicker(picker);
    }
    get value() {
        if (!this._value) {
            return "";
        }
        return NgxMatTimepickerAdapter.toLocaleTimeString(this._value, { format: this.format, locale: this._locale });
    }
    set value(value) {
        if (!value) {
            this._value = "";
            this._updateInputValue();
            return;
        }
        const time = NgxMatTimepickerAdapter.formatTime(value, { locale: this._locale, format: this.format });
        const isAvailable = NgxMatTimepickerAdapter.isTimeAvailable(time, this._min, this._max, "minutes", this._timepicker.minutesGap, this._format);
        if (isAvailable) {
            this._value = time;
            this._updateInputValue();
            return;
        }
        console.warn("Selected time doesn't match min or max value");
    }
    set _defaultTime(time) {
        this._timepicker.defaultTime = NgxMatTimepickerAdapter.formatTime(time, {
            locale: this._locale,
            format: this.format
        });
    }
    get _locale() {
        return this._timepickerLocaleSrv.locale;
    }
    constructor(_elementRef, _timepickerLocaleSrv, _matFormField) {
        this._elementRef = _elementRef;
        this._timepickerLocaleSrv = _timepickerLocaleSrv;
        this._matFormField = _matFormField;
        this.cdkOverlayOrigin = new CdkOverlayOrigin(this._matFormField ? this._matFormField.getConnectedOverlayOrigin() : this._elementRef);
        this._format = 12;
        this._subsCtrl$ = new Subject();
        this._value = "";
        this.onTouched = () => {
        };
        this._onChange = () => {
        };
    }
    ngOnChanges(changes) {
        // tslint:disable-next-line:no-string-literal
        const vChanges = changes["value"];
        if (vChanges && vChanges.currentValue) {
            this._defaultTime = vChanges.currentValue;
        }
    }
    ngOnDestroy() {
        this._unregisterTimepicker();
        this._subsCtrl$.next();
        this._subsCtrl$.complete();
    }
    onClick(event) {
        if (!this.disableClick) {
            this._timepicker.open();
            event.stopPropagation();
        }
    }
    registerOnChange(fn) {
        this._onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    updateValue(e) {
        this.value = e.target.value;
        this._onChange(this.value);
    }
    writeValue(value) {
        this.value = value;
        if (value) {
            this._defaultTime = value;
        }
    }
    _registerTimepicker(picker) {
        if (picker) {
            this._timepicker = picker;
            this._timepicker.registerInput(this);
            this._timepicker.timeSet
                .pipe(takeUntil$1(this._subsCtrl$))
                .subscribe((time) => {
                this.value = time;
                this._onChange(this.value);
                this.onTouched();
                this._defaultTime = this._value;
            });
        }
        else {
            throw new Error("NgxMatTimepickerComponent is not defined." +
                " Please make sure you passed the timepicker to ngxMatTimepicker directive");
        }
    }
    _unregisterTimepicker() {
        if (this._timepicker) {
            this._timepicker.unregisterInput();
        }
    }
    _updateInputValue() {
        this._elementRef.nativeElement.value = this.value;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerDirective, deps: [{ token: i0.ElementRef }, { token: NgxMatTimepickerLocaleService }, { token: MatFormField, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.0.0", type: NgxMatTimepickerDirective, isStandalone: true, selector: "[ngxMatTimepicker]", inputs: { format: "format", max: "max", min: "min", timepicker: ["ngxMatTimepicker", "timepicker"], value: "value", disableClick: "disableClick", disabled: "disabled" }, host: { listeners: { "blur": "onTouched()", "click": "onClick($event)", "change": "updateValue($event)" }, properties: { "disabled": "disabled", "attr.cdkOverlayOrigin": "this.cdkOverlayOrigin" } }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: NgxMatTimepickerDirective,
                multi: true
            }
        ], usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: "[ngxMatTimepicker]",
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: NgxMatTimepickerDirective,
                            multi: true
                        }
                    ],
                    // tslint:disable-next-line:no-host-metadata-property
                    host: {
                        "[disabled]": "disabled",
                        "(blur)": "onTouched()"
                    },
                    standalone: true
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: NgxMatTimepickerLocaleService }, { type: i2.MatFormField, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MatFormField]
                }] }], propDecorators: { format: [{
                type: Input
            }], max: [{
                type: Input
            }], min: [{
                type: Input
            }], timepicker: [{
                type: Input,
                args: ["ngxMatTimepicker"]
            }], value: [{
                type: Input
            }], cdkOverlayOrigin: [{
                type: HostBinding,
                args: ["attr.cdkOverlayOrigin"]
            }], disableClick: [{
                type: Input
            }], disabled: [{
                type: Input
            }], onClick: [{
                type: HostListener,
                args: ["click", ["$event"]]
            }], updateValue: [{
                type: HostListener,
                args: ["change", ["$event"]]
            }] } });

class NgxMatTimepickerTimeFormatterPipe {
    transform(time, timeUnit) {
        if (time == null || time === "") {
            return time;
        }
        switch (timeUnit) {
            case NgxMatTimepickerUnits.HOUR:
                return DateTime.fromObject({ hour: +time }).toFormat("HH");
            case NgxMatTimepickerUnits.MINUTE:
                return DateTime.fromObject({ minute: +time }).toFormat("mm");
            default:
                throw new Error("no such time unit");
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerTimeFormatterPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerTimeFormatterPipe, isStandalone: true, name: "timeFormatter" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerTimeFormatterPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: "timeFormatter",
                    standalone: true
                }]
        }] });

class NgxMatTimepickerModule {
    static setLocale(locale) {
        return {
            ngModule: NgxMatTimepickerModule,
            providers: [
                { provide: NGX_MAT_TIMEPICKER_LOCALE, useValue: locale },
                { provide: NGX_MAT_TIMEPICKER_CONFIG, useValue: undefined },
                NgxMatTimepickerLocaleService
            ]
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerModule, imports: [CommonModule,
            A11yModule,
            FormsModule,
            MatButtonModule,
            MatFormFieldModule,
            MatDialogModule,
            MatInputModule,
            MatSelectModule,
            MatToolbarModule,
            MatIconModule,
            OverlayModule,
            PortalModule,
            // Not really used, but needed to use it as abstract class
            NgxMatTimepickerBaseDirective,
            NgxMatTimepickerHoursFaceDirective,
            //
            NgxMatTimepickerActiveHourPipe,
            NgxMatTimepickerActiveMinutePipe,
            NgxMatTimepickerComponent,
            NgxMatTimepickerDialComponent,
            NgxMatTimepickerDialControlComponent,
            NgxMatTimepickerDialogComponent,
            NgxMatTimepickerDirective,
            NgxMatTimepickerFaceComponent,
            NgxMatTimepickerMinutesFaceComponent,
            NgxMatTimepickerPeriodComponent,
            NgxMatTimepickerStandaloneComponent,
            NgxMatTimepickerToggleComponent,
            NgxMatTimepicker12HoursFaceComponent,
            NgxMatTimepicker24HoursFaceComponent,
            NgxMatTimepickerToggleIconDirective,
            NgxMatTimepickerAutofocusDirective,
            NgxMatTimepickerMinutesFormatterPipe,
            NgxMatTimepickerFieldComponent,
            NgxMatTimepickerControlComponent,
            NgxMatTimepickerParserPipe,
            NgxMatTimepickerContentComponent,
            NgxMatTimepickerTimeFormatterPipe,
            NgxMatTimepickerTimeLocalizerPipe], exports: [NgxMatTimepickerComponent,
            NgxMatTimepickerToggleComponent,
            NgxMatTimepickerFieldComponent,
            NgxMatTimepickerDirective,
            NgxMatTimepickerToggleIconDirective] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerModule, providers: [
            NgxMatTimepickerLocaleService,
            {
                provide: MAT_FAB_DEFAULT_OPTIONS, useValue: { color: "void" }
            }
        ], imports: [CommonModule,
            A11yModule,
            FormsModule,
            MatButtonModule,
            MatFormFieldModule,
            MatDialogModule,
            MatInputModule,
            MatSelectModule,
            MatToolbarModule,
            MatIconModule,
            OverlayModule,
            PortalModule,
            NgxMatTimepickerComponent,
            NgxMatTimepickerDialComponent,
            NgxMatTimepickerDialControlComponent,
            NgxMatTimepickerDialogComponent,
            NgxMatTimepickerFaceComponent,
            NgxMatTimepickerMinutesFaceComponent,
            NgxMatTimepickerStandaloneComponent,
            NgxMatTimepickerToggleComponent,
            NgxMatTimepicker12HoursFaceComponent,
            NgxMatTimepicker24HoursFaceComponent,
            NgxMatTimepickerFieldComponent,
            NgxMatTimepickerControlComponent] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: NgxMatTimepickerModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        A11yModule,
                        FormsModule,
                        MatButtonModule,
                        MatFormFieldModule,
                        MatDialogModule,
                        MatInputModule,
                        MatSelectModule,
                        MatToolbarModule,
                        MatIconModule,
                        OverlayModule,
                        PortalModule,
                        // Not really used, but needed to use it as abstract class
                        NgxMatTimepickerBaseDirective,
                        NgxMatTimepickerHoursFaceDirective,
                        //
                        NgxMatTimepickerActiveHourPipe,
                        NgxMatTimepickerActiveMinutePipe,
                        NgxMatTimepickerComponent,
                        NgxMatTimepickerDialComponent,
                        NgxMatTimepickerDialControlComponent,
                        NgxMatTimepickerDialogComponent,
                        NgxMatTimepickerDirective,
                        NgxMatTimepickerFaceComponent,
                        NgxMatTimepickerMinutesFaceComponent,
                        NgxMatTimepickerPeriodComponent,
                        NgxMatTimepickerStandaloneComponent,
                        NgxMatTimepickerToggleComponent,
                        NgxMatTimepicker12HoursFaceComponent,
                        NgxMatTimepicker24HoursFaceComponent,
                        NgxMatTimepickerToggleIconDirective,
                        NgxMatTimepickerAutofocusDirective,
                        NgxMatTimepickerMinutesFormatterPipe,
                        NgxMatTimepickerFieldComponent,
                        NgxMatTimepickerControlComponent,
                        NgxMatTimepickerParserPipe,
                        NgxMatTimepickerContentComponent,
                        NgxMatTimepickerTimeFormatterPipe,
                        NgxMatTimepickerTimeLocalizerPipe
                    ],
                    exports: [
                        NgxMatTimepickerComponent,
                        NgxMatTimepickerToggleComponent,
                        NgxMatTimepickerFieldComponent,
                        NgxMatTimepickerDirective,
                        NgxMatTimepickerToggleIconDirective
                    ],
                    providers: [
                        NgxMatTimepickerLocaleService,
                        {
                            provide: MAT_FAB_DEFAULT_OPTIONS, useValue: { color: "void" }
                        }
                    ]
                }]
        }] });

// COMPONENTS

/**
 * Generated bundle index. Do not edit.
 */

export { NgxMatTimepickerComponent, NgxMatTimepickerDirective, NgxMatTimepickerFieldComponent, NgxMatTimepickerLocaleService, NgxMatTimepickerModule, NgxMatTimepickerToggleComponent, NgxMatTimepickerToggleIconDirective };
//# sourceMappingURL=ngx-mat-timepicker.mjs.map
