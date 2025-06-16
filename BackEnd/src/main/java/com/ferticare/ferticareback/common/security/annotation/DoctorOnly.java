package com.ferticare.ferticareback.common.security.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface DoctorOnly {

}