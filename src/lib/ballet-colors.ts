import { Util, MotionParams, FramedMotion } from "ballet";
import Color from "color";
import { InternalLinearGradient, LinearGradient, InternalLinearColorStop } from "./linear-gradient";

abstract class ColorMotion<InputT, T> extends FramedMotion {

  protected start: T;
  protected end: T;

  abstract makeStartStep(params: MotionParams): void;
  abstract makeEndStep(params: MotionParams): void;
  abstract makeUsualStep(params: MotionParams): void;
  abstract castInputValue(value: InputT): T;

  constructor(data: { start: InputT, end: InputT }) {
    super();

    this.start = this.castInputValue(data.start);
    this.end = this.castInputValue(data.end);
  }

  calcValue(start: number, end: number, delta: number): number {
    return Util.castToInt(start + (end - start) * delta);
  }

  calcRGBA(start: Color, end: Color, delta: number): Color {
    const r = this.calcValue(start.red(), end.red(), delta);
    const g = this.calcValue(start.green(), end.green(), delta);
    const b = this.calcValue(start.blue(), end.blue(), delta);
    const a = this.calcValue(start.alpha(), end.alpha(), delta);

    return Color([r, g, b, a]);
  }

}

abstract class LinearGradientMotion extends ColorMotion<LinearGradient, InternalLinearGradient<Color>> {

  abstract makeStep(element: HTMLElement, gradient: InternalLinearGradient<Color>): void;

  constructor(data: { start: LinearGradient, end: LinearGradient }) {
    super(data);

    if (this.start.stopList.length !== this.end.stopList.length) {
      throw new Error('Stop-list lengths of linear gradients are not equal in ' + this.motionName());
    }
  }

  castInputValue(value: LinearGradient): InternalLinearGradient<Color> {
    return {
      angle: value.angle,
      stopList: value.stopList.map(stop => ({
        lengthPercentage: stop.lengthPercentage,
        color: Color(stop.color),
      })),
    };
  }

  makeStartStep(params: MotionParams) {
    this.makeStep(params.element, this.start);
  }

  makeEndStep(params: MotionParams) {
    this.makeStep(params.element, this.end);
  }

  makeUsualStep(params: MotionParams) {
    const stopList = this.start.stopList.map((start , index): InternalLinearColorStop<Color> => {
      const lengthPercentage: number = this.calcValue(start.lengthPercentage, this.end.stopList[index].lengthPercentage, params.delta);

      return {
        lengthPercentage,
        color: this.calcRGBA(start.color, this.end.stopList[index].color, params.delta),
      };
    });

    this.makeStep(params.element, {
      stopList,
      angle: this.calcValue(this.start.angle, this.end.angle, params.delta),
    });
  }

}

export class BackgroundLinearGradientMotion extends LinearGradientMotion {

  name = 'BackgroundLinearGradientMotion';

  makeStopList(stopList: InternalLinearColorStop<Color>[]): string {
    return stopList.map(stop => `${stop.color.hexa()} ${stop.lengthPercentage}%`).join(', ');
  }

  makeBackgroundStyle(gradient: InternalLinearGradient<Color>): string {
    return `linear-gradient(${gradient.angle}deg, ${this.makeStopList(gradient.stopList)})`;
  }

  makeStep(element: HTMLElement, gradient: InternalLinearGradient<Color>) {
    element.style.background = this.makeBackgroundStyle(gradient);
  }

  turnOff(element: HTMLElement): void {
    element.style.removeProperty('background');
  }

}

export class SVGLinearGradientMotion extends LinearGradientMotion {

  name = 'SVGLinearGradientMotion';

  makeStep(element: HTMLElement, gradient: InternalLinearGradient<Color>) {
    element.setAttribute('gradientTransform', `rotate(${gradient.angle})`);
    element.innerHTML = '';
    for (let stop of gradient.stopList) {
      const stopElement = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stopElement.setAttribute('offset', `${stop.lengthPercentage}%`);
      stopElement.setAttribute('stop-color', stop.color.hexa());
      element.append(stopElement);
    }
  }

  turnOff(element: HTMLElement): void {
    element.removeAttribute('gradientTransform');
    element.innerHTML = '';
  }

}

export class FillMotion extends ColorMotion<string, Color> {

  name = 'FillMotion';

  castInputValue(value: string): Color {
    return Color(value);
  }

  makeStartStep(params: MotionParams) {
    params.element.style.fill = this.start.hexa();
  }

  makeEndStep(params: MotionParams) {
    params.element.style.fill = this.end.hexa();
  }

  makeUsualStep(params: MotionParams) {
    params.element.style.fill = this.calcRGBA(this.start, this.end, params.delta).hexa();
  }

  turnOff(element: HTMLElement): void {
    element.style.removeProperty('fill');
  }

}