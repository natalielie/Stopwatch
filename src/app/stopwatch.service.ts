import { Injectable } from "@angular/core";
import {
  pipe,
  Observable,
  timer,
  BehaviorSubject,
  Subscription,
  fromEvent
} from "rxjs";
import { 
  debounceTime, 
  map, 
  buffer, 
  filter 
} from 'rxjs/operators';

import { StopWatch } from "./stopwatch.interface";

@Injectable({
  providedIn: "root"
})

/**
 * Stopwatch service that provides the main functionality using RxJS
 */
export class StopwatchService {
  readonly #initialTime = 0;

  #timer$: BehaviorSubject<number> = new BehaviorSubject(
    this.#initialTime
  );
  #lastStopedTime: number = this.#initialTime;
  #timerSubscription: Subscription = new Subscription();
  #isRunning: boolean = false;

  constructor() {}

  /**
 * Get the stopwatch Observable #timer$
 *
 * @param StopWatch stopwatch interface
 */
  public get stopWatch$(): Observable<StopWatch> {
    return this.#timer$.pipe(
      map((seconds: number): StopWatch => this.displayStopwatch(seconds))
    );
  }

  /**
 * Starts the stopwatch from the initial time or the last stopped count
 */ 
  startCount(): void {
    if (this.#isRunning) {
      return;
    }
    // timer for emitting each value every second
    this.#timerSubscription = timer(0, 1000) 
      .pipe(map((value: number): number => value + this.#lastStopedTime))
      // each emit of the Observable will result in a emit of the BehaviorSubject timer$
      .subscribe(this.#timer$); 
    this.#isRunning = true;
  }

/**
 * Stops the stopwatch on the current count
 */ 
  stopCount(): void {
    this.#lastStopedTime = this.#timer$.value;
    this.#timerSubscription.unsubscribe();
    this.#isRunning = false;
  }

/**
 * Resets the stopwatch to 0
 */ 
  resetStopwatch(): void {
    this.#timerSubscription.unsubscribe();
    this.#lastStopedTime = this.#initialTime;
    this.#timer$.next(this.#initialTime);
    this.#isRunning = false;
  }

  /**
 * Checks if there were two consecutive clicks within 300ms and stops the time
 * 
 * @param mouse$ check if there was a click
 * @param buff$ wait 300ms before emission
 * @param click$ check if there were 2 clicks
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
  private displayStopwatch(seconds: number): StopWatch {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = seconds % 60;

    return {
      hours: this.convertToString(hours),
      minutes: this.convertToString(minutes),
      seconds: this.convertToString(secs),
    };
  }

  private convertToString(value: number): string {
    return `${value < 10 ? "0" + value : value}`;
  }

  
}
