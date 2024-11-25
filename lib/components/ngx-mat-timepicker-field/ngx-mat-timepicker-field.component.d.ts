import { EventEmitter, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";
import { MatSelectChange } from "@angular/material/select";
import { ThemePalette } from "@angular/material/core";
import { FloatLabelType } from "@angular/material/form-field";
import { NgxMatTimepickerLocaleService } from "../../services/ngx-mat-timepicker-locale.service";
import { NgxMatTimepickerFormatType } from "../../models/ngx-mat-timepicker-format.type";
import { NgxMatTimepickerService } from "../../services/ngx-mat-timepicker.service";
import { NgxMatTimepickerClockFace } from "../../models/ngx-mat-timepicker-clock-face.interface";
import { NgxMatTimepickerPeriods } from "../../models/ngx-mat-timepicker-periods.enum";
import { NgxMatTimepickerUnits } from "../../models/ngx-mat-timepicker-units.enum";
import { DateTime } from "ts-luxon";
import { BehaviorSubject } from "rxjs";
import * as i0 from "@angular/core";
export declare class NgxMatTimepickerFieldComponent implements OnInit, OnDestroy, ControlValueAccessor {
    private _timepickerService;
    private _timepickerLocaleSrv;
    get color(): ThemePalette;
    set color(newValue: ThemePalette);
    get defaultTime(): string;
    set defaultTime(val: string);
    get floatLabel(): FloatLabelType;
    set floatLabel(newValue: FloatLabelType);
    get format(): NgxMatTimepickerFormatType;
    set format(value: NgxMatTimepickerFormatType);
    get max(): DateTime;
    set max(value: string | DateTime);
    get min(): DateTime;
    set min(value: string | DateTime);
    private get _locale();
    cancelBtnTmpl: TemplateRef<Node>;
    confirmBtnTmpl: TemplateRef<Node>;
    controlOnly: boolean;
    disabled: boolean;
    hour$: BehaviorSubject<NgxMatTimepickerClockFace>;
    hoursList: NgxMatTimepickerClockFace[];
    isChangePeriodDisabled: boolean;
    isTimeRangeSet: boolean;
    maxHour: number;
    minHour: number;
    minute$: BehaviorSubject<NgxMatTimepickerClockFace>;
    minutesList: NgxMatTimepickerClockFace[];
    period: NgxMatTimepickerPeriods;
    periods: NgxMatTimepickerPeriods[];
    timeChanged: EventEmitter<string>;
    timepickerTime: string;
    timeUnit: typeof NgxMatTimepickerUnits;
    toggleIcon: TemplateRef<HTMLObjectElement>;
    private _color;
    private _defaultTime;
    private _floatLabel;
    private _format;
    private _isDefaultTime;
    private _isFirstTimeChange;
    private _max;
    private _min;
    private _previousFormat;
    private _selectedHour;
    private _subsCtrl$;
    constructor(_timepickerService: NgxMatTimepickerService, _timepickerLocaleSrv: NgxMatTimepickerLocaleService);
    changeHour(hour: number): void;
    changeMinute(minute: number): void;
    changePeriod(event: MatSelectChange): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    onTimeSet(time: string): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(val: string): void;
    private _changeDefaultTimeValue;
    private _changeTime;
    private _emitLocalTimeChange;
    private _initTime;
    private _isPeriodDisabled;
    private _onChange;
    private _onTouched;
    private _resetTime;
    private _updateAvailableHours;
    private _updateAvailableMinutes;
    private _updateAvailableTime;
    private _updateTime;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxMatTimepickerFieldComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NgxMatTimepickerFieldComponent, "ngx-mat-timepicker-field", never, { "color": { "alias": "color"; "required": false; }; "defaultTime": { "alias": "defaultTime"; "required": false; }; "floatLabel": { "alias": "floatLabel"; "required": false; }; "format": { "alias": "format"; "required": false; }; "max": { "alias": "max"; "required": false; }; "min": { "alias": "min"; "required": false; }; "cancelBtnTmpl": { "alias": "cancelBtnTmpl"; "required": false; }; "confirmBtnTmpl": { "alias": "confirmBtnTmpl"; "required": false; }; "controlOnly": { "alias": "controlOnly"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "toggleIcon": { "alias": "toggleIcon"; "required": false; }; }, { "timeChanged": "timeChanged"; }, never, never, true, never>;
}
