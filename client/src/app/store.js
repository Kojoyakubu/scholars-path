import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import curriculumReducer from '../features/curriculum/curriculumSlice';
import teacherReducer from '../features/teacher/teacherSlice';
import studentReducer from '../features/student/studentSlice';
import adminReducer from '../features/admin/adminSlice';
import paymentReducer from '../features/payment/paymentSlice';
import schoolReducer from '../features/school/schoolSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    curriculum: curriculumReducer,
    teacher: teacherReducer,
    student: studentReducer,
    admin: adminReducer,
    payment: paymentReducer,
    school: schoolReducer,
  },
});