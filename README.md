# ATS CVScore

ATS CVScore is a web app that takes your resume as a PDF, optionally takes a job description, and gives you back a cleaner version of the same resume as a new PDF. You upload, click one button, and the file downloads.

## The problem

When you apply for a job online, your resume usually goes through an Applicant Tracking System (ATS) before a person sees it. The ATS pulls the text out of your file, sorts it into sections like experience, education and skills, and searches it for keywords from the job post.

This goes wrong more often than people expect. Resumes with two columns, text boxes, icons, tables or decorative skill bars tend to come out of the ATS scrambled, with the sections mixed together or missing. Skills written in different ways ("ReactJS" in your resume, "React" in the job post) can be missed. And plain weak wording ("Responsible for working on...") makes the resume less convincing to the recruiter who reads it afterwards.

This project tries to fix those problems quickly, without sending people to a paid resume builder.

## What it does

1. You upload a text-based PDF resume and, if you want, paste the job description.
2. The app reads the text from the PDF and works out which part is your name, contact details, summary, skills, experience, projects, education and certifications.
3. It cleans up what it found:
   - bullet points are reworded to start with an action ("Responsible for developing..." becomes "Developed..."), and punctuation is made consistent
   - skill names are standardised (reactjs becomes React, nodejs becomes Node.js, postgres becomes PostgreSQL)
   - skills that match the job description are moved to the front
   - skills that appear in your experience but not in your