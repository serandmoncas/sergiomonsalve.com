alter table contact_submissions drop constraint contact_submissions_project_type_check;
alter table contact_submissions add constraint contact_submissions_project_type_check
  check (project_type in ('freelance', 'fulltime', 'collaboration', 'training'));
