from __future__ import annotations
from typing import Union, TYPE_CHECKING

from django.db import models
from django.core.validators import RegexValidator, EmailValidator
from django.contrib.auth.models import AbstractBaseUser as _ABU, PermissionsMixin as _PM
from django.utils.translation import gettext_lazy as _

from .managers import (
    UserManager,
    StudentManager,
    TeacherManager,
    ParentManager,
    ManagementManager,
)
from utils.py.utils import get_asset_directory_path

if TYPE_CHECKING:
    from django.db.models.query import QuerySet

    from api.views.klass.models import Class as ClassModel


class FileAssets(models.Model):
    id = models.AutoField(verbose_name=_("ID"), auto_created=True, primary_key=True)
    file = models.FileField(verbose_name=_("File"), upload_to=get_asset_directory_path)
    uploaded_at = models.DateTimeField(verbose_name=_("Uploaded at"), auto_created=True, auto_now_add=True)


class ImageAssets(models.Model):
    id = models.AutoField(verbose_name=_("ID"), auto_created=True, primary_key=True)
    image = models.ImageField(verbose_name=_("Image"), upload_to=get_asset_directory_path)
    uploaded_at = models.DateTimeField(verbose_name=_("Uploaded at"), auto_created=True, auto_now_add=True)


class User(_ABU, _PM):
    id = models.AutoField(verbose_name=_("ID"), auto_created=True, primary_key=True)
    username = models.CharField(
        verbose_name=_("User Name"),
        unique=True,
        max_length=64,
        help_text=_("Username of the user, to be chosen by the user themselves and should be unique."),
    )
    first_name = models.CharField(verbose_name=_("First Name"), max_length=64)
    last_name = models.CharField(verbose_name=_("Last Name"), max_length=64, null=True, blank=True)
    email_id = models.EmailField(
        verbose_name=_("Email ID"),
        unique=True,
        validators=[EmailValidator(message="Invalid email_id")],
        help_text=_("Email ID of the user, must be unique (only 1 account with an email id)"),
    )
    avatar = models.ForeignKey(to="ImageAssets", on_delete=models.SET_NULL, null=True, blank=True)
    user_type = models.CharField(
        verbose_name=_("User Type"),
        max_length=5,
        choices=[
            ("s", _("Student")),
            ("t", _("Teacher")),
            ("p", _("Parent")),
            ("m", _("Management")),
            ("a", _("Administrator")),
        ],
        help_text=_("Designation/Department/Type of user"),
    )
    date_of_birth = models.DateField(verbose_name=_("Date of Birth"), auto_now=False, auto_now_add=False)
    gender = models.CharField(
        verbose_name=_("Gender"),
        max_length=5,
        choices=[
            ("m", _("Male")),
            ("f", _("Female")),
            ("o", _("Other")),
        ],
    )
    contact_no = models.CharField(
        verbose_name=_("Contact No."),
        validators=[
            RegexValidator(
                regex=r"^\+[0-9]{5,14}$",
                message=_(
                    'Contact No. must be entered in the format: "+999999999999" (with country code). Up to 15 digits allowed'
                ),
            )
        ],
        max_length=17,
        help_text=_(
            'Contact No. of the user. Must be entered in the format: "+999999999999" (with country code). Up to 15 digits allowed'
        ),
    )
    address = models.TextField(verbose_name=_("Address"), max_length=1024, null=True, blank=True)

    date_joined = models.DateField(verbose_name=_("Date Joined"), auto_created=True, auto_now_add=True)
    last_login_ip_address = models.GenericIPAddressField(
        verbose_name=_("Last Login IP Address"), null=True, blank=True, default=None
    )

    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "username"
    EMAIL_FIELD = "email_id"
    REQUIRED_FIELDS = [
        "first_name",
        "last_name",
        "email_id",
        "user_type",
        "date_of_birth",
        "gender",
        "contact_no",
    ]

    objects: UserManager = UserManager()

    def __eq__(self, __o: object) -> bool:
        return isinstance(__o, User) and self.id == __o.id

    def __ne__(self, __o: object) -> bool:
        if not isinstance(__o, User):
            return True
        return self.id != __o.id

    def __repr__(self) -> str:
        return f"<User id={self.id} name={self.username} type={self.user_type}>"

    def __str__(self) -> str:
        return self.username

    def __int__(self) -> int:
        return int(self.id)

    @property
    def name(self) -> str:
        name = self.first_name
        if self.last_name:
            name += " " + self.last_name
        return name

    def get_full_name(self) -> str:
        name = self.first_name
        if self.last_name:
            name += " " + self.last_name
        return name

    def get_short_name(self) -> str:
        return self.first_name


class Student(models.Model):
    student = models.OneToOneField(to="User", on_delete=models.CASCADE, primary_key=True, related_name="student")
    parent = models.ForeignKey(
        to="Parent", on_delete=models.SET_NULL, null=True, blank=True, related_name="student_set"
    )
    grade = models.ForeignKey(
        to="api.Class", on_delete=models.SET_NULL, null=True, blank=True, related_name="student_set"
    )
    roll_no = models.IntegerField(verbose_name=_("Roll Number"))
    year_of_enroll = models.SmallIntegerField(verbose_name=_("Year of Enroll"))
    fee = models.IntegerField(verbose_name=_("Fee"))

    objects: StudentManager = StudentManager()

    def __eq__(self, __o: object) -> bool:
        return isinstance(__o, Student) and self.student == __o.student

    def __ne__(self, __o: object) -> bool:
        if not isinstance(__o, Student):
            return True
        return self.student != __o.student

    def __repr__(self) -> str:
        return f"<Student user={repr(self.student)} grade={repr(self.grade)} roll_no={self.roll_no}>"

    def __str__(self) -> str:
        return self.student.username

    def __int__(self) -> int:
        return int(self.student.id)


class Teacher(models.Model):
    teacher = models.OneToOneField(to="User", on_delete=models.CASCADE, primary_key=True, related_name="teacher")
    subject = models.ForeignKey(
        to="api.Subject", on_delete=models.SET_NULL, null=True, blank=True, related_name="teacher_set"
    )
    year_of_joining = models.IntegerField(verbose_name=_("Year of Joining"))
    salary = models.IntegerField(verbose_name=_("Salary"))
    classes = models.ManyToManyField(to="api.Class", related_name="teacher_set")
    owns_class = models.OneToOneField(
        "api.Class", on_delete=models.SET_NULL, null=True, blank=True, related_name="teacher"
    )

    objects: TeacherManager = TeacherManager()

    def __eq__(self, __o: object) -> bool:
        return isinstance(__o, Teacher) and self.teacher == __o.teacher

    def __ne__(self, __o: object) -> bool:
        if not isinstance(__o, Teacher):
            return True
        return self.teacher != __o.teacher

    def __repr__(self) -> str:
        string = f"<Teacher user={repr(self.teacher)} subject={repr(self.subject)}"
        if self.owns_class:
            string += f" owns_class={repr(self.owns_class)}"
        string += ">"
        return string

    def __str__(self) -> str:
        return self.teacher.username

    def __int__(self) -> int:
        return int(self.teacher.id)

    def get_assignments(self) -> QuerySet:
        return self.assignment_set.all()

    def get_assignments_for_class(self, klass: Union[int, ClassModel]) -> QuerySet:
        return self.assignment_set.filter(assigned_to=klass)


class Parent(models.Model):
    parent = models.OneToOneField(to="User", on_delete=models.CASCADE, primary_key=True, related_name="parent")

    objects: ParentManager = ParentManager()

    def get_students(self) -> QuerySet:
        return self.student_set.all()

    def __eq__(self, __o: object) -> bool:
        return isinstance(__o, Parent) and self.parent == __o.parent

    def __ne__(self, __o: object) -> bool:
        if not isinstance(__o, Parent):
            return True
        return self.parent != __o.parent

    def __repr__(self) -> str:
        return f"<Parent user={repr(self.parent)} students={repr(self.student_set.all())}>"

    def __str__(self) -> str:
        return self.parent.username

    def __int__(self) -> int:
        return int(self.parent.id)


class Management(models.Model):
    management = models.OneToOneField(to="User", on_delete=models.CASCADE, primary_key=True, related_name="management")
    role = models.CharField(verbose_name=_("Role"), max_length=255)
    year_of_joining = models.IntegerField(verbose_name=_("Year of Joining"))
    salary = models.IntegerField(verbose_name=_("Salary"))

    objects: ManagementManager = ManagementManager()

    def __eq__(self, __o: object) -> bool:
        return isinstance(__o, Management) and self.management == __o.management

    def __ne__(self, __o: object) -> bool:
        if not isinstance(__o, Management):
            return True
        return self.management != __o.management

    def __repr__(self) -> str:
        return f"<Management user={repr(self.management)} role={self.role}>"

    def __str__(self) -> str:
        return self.management.username

    def __int__(self) -> int:
        return int(self.management.id)
