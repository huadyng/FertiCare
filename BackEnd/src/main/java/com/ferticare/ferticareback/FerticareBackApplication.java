package com.ferticare.ferticareback;

import com.ferticare.ferticareback.common.config.DotenvPropertySource;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

@EnableAspectJAutoProxy
@SpringBootApplication
public class FerticareBackApplication {

    public static void main(String[] args) {

        // Tự động đọc file .env từ thư mục gốc
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        SpringApplication app = new SpringApplication(FerticareBackApplication.class);
        app.addInitializers(ctx -> ctx.getEnvironment().getPropertySources()
                .addFirst(new DotenvPropertySource("dotenv", dotenv)));
        app.run(args);
    }
}
