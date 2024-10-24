import { DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { Student } from './Student'
import { Course } from './Course'

export class StudentToCourse extends Model<
    InferAttributes<StudentToCourse>,
    InferCreationAttributes<StudentToCourse>
> {
    declare StudentId: ForeignKey<Student['id']>
    declare CourseId: ForeignKey<Course['id']>
}

export const STUDENT_TO_COURSE_FIELDS = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    StudentId: {
        type: DataTypes.INTEGER,
    },
    CourseId: {
        type: DataTypes.INTEGER,
    },
}
