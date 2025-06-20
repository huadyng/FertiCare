USE [master]
GO
/****** Object:  Database [Infertility_Treatment]    Script Date: 6/7/2025 2:48:42 PM ******/
CREATE DATABASE [Infertility_Treatment]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'Infertility_Treatment', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL15.SQLSERVER\MSSQL\DATA\Infertility_Treatment.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'Infertility_Treatment_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL15.SQLSERVER\MSSQL\DATA\Infertility_Treatment_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT
GO
ALTER DATABASE [Infertility_Treatment] SET COMPATIBILITY_LEVEL = 150
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [Infertility_Treatment].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [Infertility_Treatment] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET ARITHABORT OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [Infertility_Treatment] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [Infertility_Treatment] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET  ENABLE_BROKER 
GO
ALTER DATABASE [Infertility_Treatment] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [Infertility_Treatment] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET RECOVERY FULL 
GO
ALTER DATABASE [Infertility_Treatment] SET  MULTI_USER 
GO
ALTER DATABASE [Infertility_Treatment] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [Infertility_Treatment] SET DB_CHAINING OFF 
GO
ALTER DATABASE [Infertility_Treatment] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [Infertility_Treatment] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [Infertility_Treatment] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [Infertility_Treatment] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'Infertility_Treatment', N'ON'
GO
ALTER DATABASE [Infertility_Treatment] SET QUERY_STORE = OFF
GO
USE [Infertility_Treatment]
GO
/****** Object:  Table [dbo].[appointment]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[appointment](
	[appointment_id] [uniqueidentifier] NOT NULL,
	[request_id] [uniqueidentifier] NOT NULL,
	[doctor_id] [uniqueidentifier] NOT NULL,
	[customer_id] [uniqueidentifier] NOT NULL,
	[appointment_time] [datetime] NOT NULL,
	[room] [nvarchar](100) NULL,
	[check_in_status] [varchar](20) NULL,
	[created_at] [datetime] NOT NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[appointment_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[appointmentProposal]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[appointmentProposal](
	[proposal_id] [uniqueidentifier] NOT NULL,
	[request_id] [uniqueidentifier] NOT NULL,
	[proposed_datetime] [datetime] NOT NULL,
	[room] [nvarchar](100) NULL,
	[expiration_time] [datetime] NULL,
	[status] [varchar](20) NOT NULL,
	[created_at] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[proposal_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[blog]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[blog](
	[blog_id] [uniqueidentifier] NOT NULL,
	[author_id] [uniqueidentifier] NOT NULL,
	[title] [nvarchar](255) NOT NULL,
	[content] [nvarchar](max) NULL,
	[cover_image] [varchar](255) NULL,
	[tags] [nvarchar](max) NULL,
	[status] [varchar](20) NOT NULL,
	[view_count] [int] NULL,
	[created_at] [datetime] NOT NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[blog_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[clinical_Result]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[clinical_Result](
	[result_id] [uniqueidentifier] NOT NULL,
	[visit_id] [uniqueidentifier] NOT NULL,
	[result_type] [varchar](20) NOT NULL,
	[content] [nvarchar](max) NULL,
	[created_at] [datetime] NOT NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[result_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[comment]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[comment](
	[comment_id] [uniqueidentifier] NOT NULL,
	[blog_id] [uniqueidentifier] NOT NULL,
	[user_id] [uniqueidentifier] NOT NULL,
	[content] [nvarchar](max) NOT NULL,
	[parent_id] [uniqueidentifier] NULL,
	[created_at] [datetime] NOT NULL,
	[updated_at] [datetime] NULL,
	[is_visible] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[comment_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[doctorAssignment]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[doctorAssignment](
	[assignment_id] [uniqueidentifier] NOT NULL,
	[request_id] [uniqueidentifier] NOT NULL,
	[assigned_doctor_id] [uniqueidentifier] NOT NULL,
	[assigned_by] [uniqueidentifier] NULL,
	[previous_doctor_id] [uniqueidentifier] NULL,
	[reason] [nvarchar](max) NULL,
	[assigned_at] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[assignment_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[notification]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[notification](
	[notification_id] [uniqueidentifier] NOT NULL,
	[user_id] [uniqueidentifier] NOT NULL,
	[schedule_id] [uniqueidentifier] NULL,
	[notification_type] [varchar](20) NOT NULL,
	[message] [nvarchar](max) NULL,
	[send_time] [datetime] NOT NULL,
	[status] [varchar](20) NOT NULL,
	[config_reminder_time] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[notification_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[patient_Visit]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[patient_Visit](
	[visit_id] [uniqueidentifier] NOT NULL,
	[user_id] [uniqueidentifier] NOT NULL,
	[doctor_id] [uniqueidentifier] NOT NULL,
	[visit_date] [datetime] NOT NULL,
	[symptoms] [nvarchar](max) NULL,
	[physical_findings] [nvarchar](max) NULL,
	[diagnosis] [nvarchar](max) NULL,
	[notes] [nvarchar](max) NULL,
	[created_at] [datetime] NOT NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[visit_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[profile]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[profile](
	[profile_id] [uniqueidentifier] NOT NULL,
	[user_id] [uniqueidentifier] NOT NULL,
	[specialty] [nvarchar](255) NULL,
	[qualification] [nvarchar](255) NULL,
	[experience_years] [int] NULL,
	[work_schedule] [nvarchar](max) NULL,
	[rating] [float] NULL,
	[case_count] [int] NULL,
	[notes] [nvarchar](max) NULL,
	[status] [varchar](20) NOT NULL,
	[marital_status] [nvarchar](100) NULL,
	[health_background] [nvarchar](max) NULL,
	[assigned_department] [nvarchar](100) NULL,
	[extra_permissions] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[profile_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[reminderLog]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[reminderLog](
	[reminder_id] [uniqueidentifier] NOT NULL,
	[appointment_id] [uniqueidentifier] NOT NULL,
	[reminder_time] [datetime] NOT NULL,
	[channel] [varchar](20) NOT NULL,
	[status] [varchar](20) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[reminder_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[role]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[role](
	[role_id] [uniqueidentifier] NOT NULL,
	[user_id] [uniqueidentifier] NOT NULL,
	[role_type] [varchar](20) NOT NULL,
	[role_level] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[role_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[serviceRequest]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[serviceRequest](
	[request_id] [uniqueidentifier] NOT NULL,
	[customer_id] [uniqueidentifier] NOT NULL,
	[preferred_datetime] [datetime] NULL,
	[note] [nvarchar](max) NULL,
	[doctor_selection] [varchar](10) NULL,
	[prefered_doctor_id] [uniqueidentifier] NULL,
	[status] [varchar](50) NOT NULL,
	[created_at] [datetime] NOT NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[request_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[treatment_Phase]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[treatment_Phase](
	[phase_id] [uniqueidentifier] NOT NULL,
	[service_id] [uniqueidentifier] NOT NULL,
	[phase_name] [nvarchar](255) NOT NULL,
	[phase_order] [int] NOT NULL,
	[description] [nvarchar](max) NULL,
	[expected_duration] [int] NULL,
	[created_at] [datetime] NOT NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[phase_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[treatment_Phase_Status]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[treatment_Phase_Status](
	[status_id] [uniqueidentifier] NOT NULL,
	[treatment_plan_id] [uniqueidentifier] NOT NULL,
	[phase_id] [uniqueidentifier] NOT NULL,
	[status] [varchar](20) NOT NULL,
	[start_date] [datetime] NULL,
	[end_date] [datetime] NULL,
	[notes] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[status_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[treatment_Plan]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[treatment_Plan](
	[plan_id] [uniqueidentifier] NOT NULL,
	[visit_id] [uniqueidentifier] NOT NULL,
	[template_id] [uniqueidentifier] NOT NULL,
	[customized_steps] [nvarchar](max) NULL,
	[created_at] [datetime] NOT NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[plan_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[treatment_Plan_Template]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[treatment_Plan_Template](
	[template_id] [uniqueidentifier] NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[description] [nvarchar](max) NULL,
	[steps] [nvarchar](max) NULL,
	[created_at] [datetime] NOT NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[template_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[treatment_Result]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[treatment_Result](
	[result_id] [uniqueidentifier] NOT NULL,
	[schedule_step_id] [uniqueidentifier] NOT NULL,
	[summary] [nvarchar](max) NULL,
	[details] [nvarchar](max) NULL,
	[complication_note] [nvarchar](max) NULL,
	[file_url] [varchar](255) NULL,
	[status] [varchar](20) NOT NULL,
	[created_at] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[result_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[treatment_Schedule]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[treatment_Schedule](
	[schedule_id] [uniqueidentifier] NOT NULL,
	[plan_id] [uniqueidentifier] NOT NULL,
	[scheduled_date] [datetime] NOT NULL,
	[treatment_type] [varchar](50) NOT NULL,
	[room_id] [uniqueidentifier] NULL,
	[status] [varchar](20) NOT NULL,
	[notes] [nvarchar](max) NULL,
	[created_at] [datetime] NOT NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[schedule_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[users]    Script Date: 6/7/2025 2:48:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[users](
	[user_id] [uniqueidentifier] NOT NULL,
	[full_name] [nvarchar](100) NOT NULL,
	[gender] [varchar](10) NOT NULL,
	[date_of_birth] [date] NOT NULL,
	[email] [varchar](100) NOT NULL,
	[phone] [varchar](20) NULL,
	[address] [nvarchar](255) NULL,
	[avatar_url] [varchar](255) NULL,
	[created_at] [datetime] NOT NULL,
	[updated_at] [datetime] NULL,
	[password] [varchar](255) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[appointment] ADD  DEFAULT (newid()) FOR [appointment_id]
GO
ALTER TABLE [dbo].[appointment] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[appointmentProposal] ADD  DEFAULT (newid()) FOR [proposal_id]
GO
ALTER TABLE [dbo].[appointmentProposal] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[blog] ADD  DEFAULT (newid()) FOR [blog_id]
GO
ALTER TABLE [dbo].[blog] ADD  DEFAULT ((0)) FOR [view_count]
GO
ALTER TABLE [dbo].[blog] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[clinical_Result] ADD  DEFAULT (newid()) FOR [result_id]
GO
ALTER TABLE [dbo].[clinical_Result] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[comment] ADD  DEFAULT (newid()) FOR [comment_id]
GO
ALTER TABLE [dbo].[comment] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[comment] ADD  DEFAULT ((1)) FOR [is_visible]
GO
ALTER TABLE [dbo].[doctorAssignment] ADD  DEFAULT (newid()) FOR [assignment_id]
GO
ALTER TABLE [dbo].[doctorAssignment] ADD  DEFAULT (getdate()) FOR [assigned_at]
GO
ALTER TABLE [dbo].[notification] ADD  DEFAULT (newid()) FOR [notification_id]
GO
ALTER TABLE [dbo].[patient_Visit] ADD  DEFAULT (newid()) FOR [visit_id]
GO
ALTER TABLE [dbo].[patient_Visit] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[profile] ADD  DEFAULT (newid()) FOR [profile_id]
GO
ALTER TABLE [dbo].[reminderLog] ADD  DEFAULT (newid()) FOR [reminder_id]
GO
ALTER TABLE [dbo].[serviceRequest] ADD  DEFAULT (newid()) FOR [request_id]
GO
ALTER TABLE [dbo].[serviceRequest] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[treatment_Phase] ADD  DEFAULT (newid()) FOR [phase_id]
GO
ALTER TABLE [dbo].[treatment_Phase] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[treatment_Phase_Status] ADD  DEFAULT (newid()) FOR [status_id]
GO
ALTER TABLE [dbo].[treatment_Plan] ADD  DEFAULT (newid()) FOR [plan_id]
GO
ALTER TABLE [dbo].[treatment_Plan] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[treatment_Plan_Template] ADD  DEFAULT (newid()) FOR [template_id]
GO
ALTER TABLE [dbo].[treatment_Plan_Template] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[treatment_Result] ADD  DEFAULT (newid()) FOR [result_id]
GO
ALTER TABLE [dbo].[treatment_Result] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[treatment_Schedule] ADD  DEFAULT (newid()) FOR [schedule_id]
GO
ALTER TABLE [dbo].[treatment_Schedule] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT (newid()) FOR [user_id]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[appointment]  WITH CHECK ADD FOREIGN KEY([customer_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[appointment]  WITH CHECK ADD FOREIGN KEY([doctor_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[appointment]  WITH CHECK ADD FOREIGN KEY([request_id])
REFERENCES [dbo].[serviceRequest] ([request_id])
GO
ALTER TABLE [dbo].[appointmentProposal]  WITH CHECK ADD FOREIGN KEY([request_id])
REFERENCES [dbo].[serviceRequest] ([request_id])
GO
ALTER TABLE [dbo].[blog]  WITH CHECK ADD FOREIGN KEY([author_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[clinical_Result]  WITH CHECK ADD FOREIGN KEY([visit_id])
REFERENCES [dbo].[patient_Visit] ([visit_id])
GO
ALTER TABLE [dbo].[comment]  WITH CHECK ADD FOREIGN KEY([blog_id])
REFERENCES [dbo].[blog] ([blog_id])
GO
ALTER TABLE [dbo].[comment]  WITH CHECK ADD FOREIGN KEY([parent_id])
REFERENCES [dbo].[comment] ([comment_id])
GO
ALTER TABLE [dbo].[comment]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[doctorAssignment]  WITH CHECK ADD FOREIGN KEY([assigned_by])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[doctorAssignment]  WITH CHECK ADD FOREIGN KEY([request_id])
REFERENCES [dbo].[serviceRequest] ([request_id])
GO
ALTER TABLE [dbo].[notification]  WITH CHECK ADD FOREIGN KEY([schedule_id])
REFERENCES [dbo].[treatment_Schedule] ([schedule_id])
GO
ALTER TABLE [dbo].[notification]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[patient_Visit]  WITH CHECK ADD FOREIGN KEY([doctor_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[patient_Visit]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[profile]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[reminderLog]  WITH CHECK ADD FOREIGN KEY([appointment_id])
REFERENCES [dbo].[appointment] ([appointment_id])
GO
ALTER TABLE [dbo].[role]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[serviceRequest]  WITH CHECK ADD FOREIGN KEY([customer_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[treatment_Phase_Status]  WITH CHECK ADD FOREIGN KEY([phase_id])
REFERENCES [dbo].[treatment_Phase] ([phase_id])
GO
ALTER TABLE [dbo].[treatment_Phase_Status]  WITH CHECK ADD FOREIGN KEY([treatment_plan_id])
REFERENCES [dbo].[treatment_Plan] ([plan_id])
GO
ALTER TABLE [dbo].[treatment_Plan]  WITH CHECK ADD FOREIGN KEY([template_id])
REFERENCES [dbo].[treatment_Plan_Template] ([template_id])
GO
ALTER TABLE [dbo].[treatment_Plan]  WITH CHECK ADD FOREIGN KEY([visit_id])
REFERENCES [dbo].[patient_Visit] ([visit_id])
GO
ALTER TABLE [dbo].[treatment_Result]  WITH CHECK ADD FOREIGN KEY([schedule_step_id])
REFERENCES [dbo].[treatment_Schedule] ([schedule_id])
GO
ALTER TABLE [dbo].[treatment_Schedule]  WITH CHECK ADD FOREIGN KEY([plan_id])
REFERENCES [dbo].[treatment_Plan] ([plan_id])
GO
ALTER TABLE [dbo].[appointment]  WITH CHECK ADD CHECK  (([check_in_status]='Missed' OR [check_in_status]='CheckedIn' OR [check_in_status]='Pending'))
GO
ALTER TABLE [dbo].[appointmentProposal]  WITH CHECK ADD CHECK  (([status]='Expired' OR [status]='Rejected' OR [status]='Confirmed' OR [status]='Pending'))
GO
ALTER TABLE [dbo].[blog]  WITH CHECK ADD CHECK  (([status]='archived' OR [status]='published' OR [status]='draft'))
GO
ALTER TABLE [dbo].[clinical_Result]  WITH CHECK ADD CHECK  (([result_type]='Other' OR [result_type]='Text' OR [result_type]='Image' OR [result_type]='Lab'))
GO
ALTER TABLE [dbo].[notification]  WITH CHECK ADD CHECK  (([notification_type]='App' OR [notification_type]='Email'))
GO
ALTER TABLE [dbo].[notification]  WITH CHECK ADD CHECK  (([status]='Pending' OR [status]='Failed' OR [status]='Sent'))
GO
ALTER TABLE [dbo].[profile]  WITH CHECK ADD CHECK  (([status]='on_leave' OR [status]='inactive' OR [status]='active'))
GO
ALTER TABLE [dbo].[reminderLog]  WITH CHECK ADD CHECK  (([channel]='Zalo' OR [channel]='InApp' OR [channel]='Email' OR [channel]='SMS'))
GO
ALTER TABLE [dbo].[reminderLog]  WITH CHECK ADD CHECK  (([status]='Failed' OR [status]='Sent'))
GO
ALTER TABLE [dbo].[role]  WITH CHECK ADD CHECK  (([role_type]='Admin' OR [role_type]='Manager' OR [role_type]='Doctor' OR [role_type]='Customer'))
GO
ALTER TABLE [dbo].[serviceRequest]  WITH CHECK ADD CHECK  (([doctor_selection]='Auto' OR [doctor_selection]='Manual'))
GO
ALTER TABLE [dbo].[serviceRequest]  WITH CHECK ADD CHECK  (([status]='Cancelled' OR [status]='MissedAppointment' OR [status]='UnconfirmedExpired' OR [status]='Re-ProposeSchedule' OR [status]='Scheduled' OR [status]='PendingScheduleProposal' OR [status]='PendingAssignment'))
GO
ALTER TABLE [dbo].[treatment_Phase_Status]  WITH CHECK ADD CHECK  (([status]='Cancelled' OR [status]='Completed' OR [status]='In Progress' OR [status]='Pending'))
GO
ALTER TABLE [dbo].[treatment_Result]  WITH CHECK ADD CHECK  (([status]='pending' OR [status]='failed' OR [status]='success'))
GO
ALTER TABLE [dbo].[treatment_Schedule]  WITH CHECK ADD CHECK  (([status]='Cancelled' OR [status]='Completed' OR [status]='Scheduled'))
GO
ALTER TABLE [dbo].[treatment_Schedule]  WITH CHECK ADD CHECK  (([treatment_type]='Lab Test' OR [treatment_type]='Ultrasound' OR [treatment_type]='IVF' OR [treatment_type]='IUI' OR [treatment_type]='Injection'))
GO
ALTER TABLE [dbo].[users]  WITH CHECK ADD CHECK  (([gender]='OTHER' OR [gender]='FEMALE' OR [gender]='MALE'))
GO
USE [master]
GO
ALTER DATABASE [Infertility_Treatment] SET  READ_WRITE 
GO
