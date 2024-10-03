#!/usr/bin/perl
use warnings; 
use strict; 
use Data::Dumper;
use CGI qw(:standard); 
use POSIX qw(strftime);
my $now = time();
# We need to munge the timezone indicator to add a colon between the hour and minute part
my $time_zone = strftime("%z", localtime($now));
$time_zone =~ s/(\d{2})(\d{2})/$1:$2/;
# ISO8601
my $datetime = strftime("%Y-%m-%dT%H:%M:%S", localtime($now)) . $time_zone;
my $query = new CGI;
my $hostname = $query->param('hostname');
my $ip = $query->param('ip'); 
my $pipeline = $query->param('pipeline'); 
my $steps = $query->param('steps'); 
my $samples = $query->param('samples'); 
my $md5 = $query->param('md5') // ""; 
print $query->header("text/plain"); 
open LOG, ">>/data/mugqic_pipelines.log" or die "Couldn't open file: $!";
print LOG join("\t",
  $datetime,
  "request_ip=" . $ENV{'REMOTE_ADDR'},
  "request_method=" . $ENV{'REQUEST_METHOD'},
  "http_user_agent=" . $ENV{'HTTP_USER_AGENT'},
  "hostname=$hostname",
  "host_ip=$ip",
  "pipeline=$pipeline",
  "steps=$steps",
  "nb_samples=$samples",
  "md5=$md5"
), "\n";
close LOG;
