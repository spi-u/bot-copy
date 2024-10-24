import {Course} from "../models/Course";

export const isWithRatings = (courses: Course[]) => {
    return !!courses.filter(course => course.withRatings).length
}

export const canSelectAnotherCourse = (allCourses: Course[], studentCourses: Course[], isSimple = false) => {
    if (isSimple) return false

    const coursesIds = allCourses.map(c => c.id)
    const studentCoursesIds = studentCourses.map(c => c.id)
    return !coursesIds.every(id => studentCoursesIds.includes(id))
}