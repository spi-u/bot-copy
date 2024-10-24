import {Markup} from "telegraf";
import {Course} from "../models/Course";


export enum CourseEvents {
    ON_COURSE_SELECT = 'ON_COURSE_SELECT',
    CONTINUE = 'CONTINUE'
}
const createListKeyboard = (courses: Course[], alreadyInCourse = false) => {
    const buttons = courses.map(course => [Markup.button.callback(course.name, `${CourseEvents.ON_COURSE_SELECT}_${course.id}`)])
    if (alreadyInCourse) {
        buttons.push([Markup.button.callback('Хочу продолжить', CourseEvents.CONTINUE)])
    }
    return Markup.inlineKeyboard(buttons)
}

export const courseKeyboards = {
    createListKeyboard,
}