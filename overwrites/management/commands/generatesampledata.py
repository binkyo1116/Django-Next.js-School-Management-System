from __future__ import annotations
from typing import Any

import numpy as np
import pandas as pd

from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand

from root.models import Parent, User
from api.views.klass.models import Class
from api.views.subject.models import Subject
from api.views.assignment.models import Assignment

from utils.py.utils import DataURI, SpinnerMessage


class Command(BaseCommand):
    help = "Generates sample data for testing"

    def handle(self, *args: Any, **options: Any) -> None:
        self.stdout.write("Generating Sample Data...")

        try:
            with SpinnerMessage("Creating Classes"):
                classes_df = pd.read_csv("SampleData/classes.csv", sep=",")
                for _, row in classes_df.iterrows():
                    Class.objects.create(grade=row["Grade"], section=row["Section"])

            with SpinnerMessage("Creating Subjects"):
                subjects_df = pd.read_csv("SampleData/subjects.csv", sep=",")
                for _, row in subjects_df.iterrows():
                    Subject.objects.create(name=row["Name"], code=row["Code"])

            with SpinnerMessage("Creating Users"):
                users_df = pd.read_csv(
                    "SampleData/users.csv",
                    sep=",",
                    converters={
                        "Contact No.": lambda x: f"+{x}" if not x.startswith("+") else x,
                    },
                )
                for _, row in users_df.iterrows():
                    data = {
                        "username": row["Username"],
                        "first_name": row["First Name"],
                        "last_name": row["Last Name"],
                        "email_id": row["Email ID"],
                        "user_type": "s"
                        if row["User Type"] == "Student"
                        else "t"
                        if row["User Type"] == "Teacher"
                        else "p"
                        if row["User Type"] == "Parent"
                        else "m"
                        if row["User Type"] == "Management"
                        else "a"
                        if row["User Type"] == "Admin"
                        else None,
                        "date_of_birth": row["Date of Birth"],
                        "gender": "m"
                        if row["Gender"] == "Male"
                        else "f"
                        if row["Gender"] == "Female"
                        else "o"
                        if row["Gender"] == "Other"
                        else None,
                        "contact_no": row["Contact No."],
                        "password": row["Password"],
                    }

                    if data["user_type"] == "a":
                        data.pop("user_type")
                        User.objects.create_superuser(**data)

                    # The data needs to be processed and User.objects.create() method must be used for users other than Admin
                    else:
                        if data["user_type"] == "s":
                            parent = None
                            if row["Parent's Username"] is not np.nan:
                                parent = Parent.objects.get(parent__username=row["Parent's Username"])

                            data = {
                                **data,
                                "parent": parent,
                                "grade": int(row["Grade ID"]),
                                "roll_no": int(row["Roll No."]),
                                "year_of_enroll": int(row["Year of Enroll"]),
                                "fee": int(row["Fee"]),
                            }

                        elif data["user_type"] == "t":
                            subject = None
                            classes = None
                            owns_class = None
                            if row["Subject ID"] is not np.nan:
                                subject = Subject.objects.get(id=int(row["Subject ID"]))
                            if row["Classes IDs"] is not np.nan:
                                classes_ids = row["Classes IDs"].split()
                                classes = Class.objects.filter(id__in=classes_ids)
                            if row["Owns Class ID"] is not np.nan:
                                owns_class = Class.objects.get(id=int(row["Owns Class ID"]))

                            data = {
                                **data,
                                "subject": subject,
                                "year_of_joining": int(row["Year of Joining"]),
                                "salary": int(row["Salary"]),
                                "classes": classes,
                                "owns_class": owns_class,
                            }

                        elif data["user_type"] == "p":
                            pass  # Data will be unchanged in case of Parent User

                        elif data["user_type"] == "m":
                            data = {
                                **data,
                                "year_of_joining": int(row["Year of Joining"]),
                                "role": row["Role"],
                                "salary": int(row["Salary"]),
                            }

                        User.objects.create(**data)

            with SpinnerMessage("Creating Assignments"):
                assignments_df = pd.read_csv("SampleData/assignments.csv", sep=",")
                for _, row in assignments_df.iterrows():
                    Assignment.objects.create(
                        title=row["Title"],
                        assigned_by=row["Assigned By ID"],
                        assigned_to=row["Assigned To ID"].split(),
                        submission_date=row["Submission Date"],
                        file=DataURI.from_file(row["File Path"]),
                        message=row["Message"],
                    )

        except ValidationError as e:
            self.stderr.write(
                "Data Validation Error. Please check the CSV files for proper data structured.\n"
                f"Original Exception: {str(e)}"
            )
        except Exception as e:
            self.stderr.write(str(e))
        else:
            self.stdout.write(self.style.SUCCESS("Generated Sample Data Successfully!"))
            self.stdout.write(
                self.style.WARNING(
                    "WARNING: You must not run this command again with the same database as it may lead to data collision."
                )
            )
