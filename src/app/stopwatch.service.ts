import { Injectable } from "@angular/core";
import {
  Observable,
  timer,
  BehaviorSubject,
  Subscription,
  fromEvent
} from "rxjs";
import { debounceTime, map, buffer, filter } from 'rxjs/operators';

import { StopWatch } from "./stopwatch.interface";

@Injectable({
  providedIn: "root"
})

/**
 * Stopwatch service that provides the main functionality using RxJS
 */
export class StopwatchService {
  readonly #initialTime = 0;
  #secondClick = false;
  #actualDelay = 0;
  #delayTime = 300;

  #timer$: BehaviorSubject<number> = new BehaviorSubject(
    this.#initialTime
  );
  #lastStopedTime: number = this.#initialTime;
  #timerSubscription: Subscription = new Subscription();
  #isRunning: boolean = false;

  constructor() {}

  /**
 * Get the stopwatch Observable
 *
 * @param StopWatch stopwatch interface
 */
  public get stopWatch$(): Observable<StopWatch> {
    return this.#timer$.pipe(
      map((seconds: number): StopWatch => this.secondsToStopWatch(seconds))
    );
  }

  startCount(): void {
    if (this.#isRunning) {
      return;
    }
    this.#timerSubscription = timer(0, 1000) // Timer, so that the first emit is instantly (interval waits until the period is over for the first emit)
      .pipe(map((value: number): number => value + this.#lastStopedTime))
      .subscribe(this.#timer$); // each emit of the Observable will result in a emit of the BehaviorSubject timer$
    this.#isRunning = true;
  }

  stopCount(): void {
    this.#lastStopedTime = this.#timer$.value;
    this.#timerSubscription.unsubscribe();
    this.#isRunning = false;
  }

  resetStopwatch(): void {
    this.#timerSubscription.unsubscribe();
    this.#lastStopedTime = this.#initialTime;
    this.#timer$.next(this.#initialTime);
    this.#isRunning = false;
  }

  /**
 * Checks if there were two consecutive clicks within 300ms and stops the time
 */  
  waitCount(): void {
    const mouse$ = fromEvent(document, 'click')
    const buff$ = mouse$.pipe(
      debounceTime(300),
    )
    const click$ = mouse$.pipe(
      buffer(buff$),
      map(list => {
        return list.length;
      }),
      filter(x => x === 2),
    )
    click$.subscribe(() => 
          this.stopCount()
        );
    }

  /**
 * Format time to display properly
 *
 * @param seconds used to convert seconds to format hh:mm:ss
 */
  private secondsToStopWatch(seconds: number): StopWatch {
    let rest = seconds;
    const hours = Math.floor(seconds / 3600);
    rest = seconds % 3600;
    const minutes = Math.floor(rest / 60);
    rest = seconds % 60;

    return {
      hours: this.convertToNumberString(hours),
      minutes: this.convertToNumberString(minutes),
      seconds: this.convertToNumberString(rest),
    };
  }

  private convertToNumberString(value: number): string {
    return `${value < 10 ? "0" + value : value}`;
  }

  
}
