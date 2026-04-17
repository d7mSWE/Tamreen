\# Tamreen | Quiz Creation Platform 

&#x20;

Tamreen is a smart and interactive platform for creating and sharing customized quizzes. Built with Spring Boot (Java) for the backend and plain HTML/CSS/JS with Bootstrap 5 for the frontend, it provides an intuitive experience for both quiz creators and participants. 

&#x20;

\## ✨ Key Features 

&#x20;

\- \*\*Create Custom Quizzes:\*\* Supports various question types (Multiple Choice, True/False, Multiple Selection). 

\- \*\*Easy Sharing:\*\* Generate unique links to share quizzes instantly with anyone. 

\- \*\*User Authentication:\*\* Secure user registration, login, and profile management. 

\- \*\*Bilingual Interface:\*\* Full support for Arabic (RTL) and English (LTR) languages. 

\- \*\*Themes:\*\* Built-in Light and Dark modes. 

\- \*\*Responsive Design:\*\* Fully optimized for desktops, tablets, and mobile devices. 

&#x20;

\## 🛠️ Prerequisites 

&#x20;

Before you begin, ensure you have the following installed on your machine: 

\- \*\*Java Development Kit (JDK)\*\* 17 or higher 

\- \*\*Maven\*\* (for building and managing dependencies) 

\- \*\*MySQL Server\*\* (running locally or remotely) 

\- \*\*Eclipse IDE\*\* (or IntelliJ IDEA / VS Code) 

&#x20;

\## 🚀 Setup \& Installation 

&#x20;

\### 1. Clone the Repository 

Clone this project to your local machine: 

```bash 

git clone https://github.com/d7mSWE/Tamreen.git  

``` 

&#x20;

\### 2. Configure the Database 

The application requires a MySQL database to store users and quizzes.  

&#x20;

Open the `src/main/resources/application.properties` file and update your MySQL credentials (username and password). You need also to put your database name in the URL: 

&#x20;

```properties 

\# Database connection URL - check your database server details (host, port, database name, username, password, etc...) and added in the url. 

spring.datasource.url=jdbc:mysql://localhost:3306/your\_db\_name?createDatabaseIfNotExist=true\&useSSL=false\&serverTimezone=UTC 

&#x20;

\# Change these to your actual MySQL username and password 

spring.datasource.username=your\_username 

spring.datasource.password=your\_password 

&#x20;

\# Hibernate settings 

spring.jpa.hibernate.ddl-auto=update 

spring.jpa.show-sql=true 

spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect 

``` 

&#x20;

\### 3. Run the Application 

You can run the application using either your IDE or the command line. 

&#x20;

\#### Option A: Using Eclipse IDE (Recommended) 

1\. Open Eclipse. 

2\. Go to \*\*File\*\* > \*\*Import...\*\* > \*\*Maven\*\* > \*\*Existing Maven Projects\*\* and click \*\*Next\*\*. 

3\. Browse to the `Tamreen` folder you cloned, select it, and click \*\*Finish\*\*. 

4\. Wait for Eclipse to download the dependencies. 

5\. In the Project Explorer, navigate to `src/main/java/me/d7mSWE/tamreen/` and find `Main.java`. 

6\. Right-click on `Main.java` > \*\*Run As\*\* > \*\*Java Application\*\* (or \*\*Spring Boot App\*\* if you have the Spring Tools plugin installed). 

&#x20;

\#### Option B: Using Command Line (Terminal) 

Open your terminal in the project's root directory and run the following Maven command: 

```bash 

mvn spring-boot:run 

``` 

&#x20;

\### 4. Access the Platform 

Once the Spring Boot application starts successfully, open your web browser and visit: 

```text 

http://localhost:8080 

``` 

\*(The port is `8080` by default unless specified otherwise in your properties).\* 

&#x20;

\--- 

\*\*Enjoy creating quizzes with Tamreen Platform!\*\*

