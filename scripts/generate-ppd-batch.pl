#!/usr/bin/perl
# Batch PPD generator using Foomatic::DB.
#
# Reads newline-separated "printerId:driverId:outputPath" lines from STDIN.
# Loads the Foomatic database once and reuses the in-memory cache for all
# combos, which is dramatically faster than invoking foomatic-ppdfile once
# per combination (which would re-read the full XML database each time).
#
# Usage:
#   FOOMATICDB=/path/to/foomatic-db \
#     perl generate-ppd-batch.pl < combos.txt
#
# Each line of STDIN: printerId:driverId:outputPath
# Exit code 0 on success.

use strict;
use warnings;
use Foomatic::Defaults;
use Foomatic::DB;
use File::Basename qw(dirname);
use File::Path qw(make_path);

# Apply FOOMATICDB env override (mirrors Foomatic::Defaults behaviour)
if ($ENV{FOOMATICDB}) {
    $Foomatic::Defaults::libdir = $ENV{FOOMATICDB};
}

# Initialise DB and build the in-memory overview once.
my $db = Foomatic::DB->new();
$db->get_overview();

my ($generated, $failed) = (0, 0);

while (my $line = <STDIN>) {
    chomp $line;
    next unless $line =~ /\S/;

    my ($printer_id, $driver_id, $output_path) = split(/:/, $line, 3);
    unless ($printer_id && $driver_id && $output_path) {
        warn "Skipping malformed line: $line\n";
        next;
    }

    # Ensure output directory exists
    my $dir = dirname($output_path);
    make_path($dir) unless -d $dir;

    # Generate combo data and PPD
    my $possible = $db->getdat($driver_id, $printer_id);
    unless ($possible) {
        print "FAIL:$printer_id:$driver_id\n";
        $failed++;
        next;
    }

    unless ($db->{'dat'}{'cmd'} || $db->{'dat'}{'ppdfile'}) {
        print "FAIL:$printer_id:$driver_id\n";
        $failed++;
        next;
    }

    my @ppd_lines = $db->getppd(0);
    unless (@ppd_lines) {
        print "FAIL:$printer_id:$driver_id\n";
        $failed++;
        next;
    }

    # Write the PPD file
    if (open my $fh, '>', $output_path) {
        print $fh @ppd_lines;
        close $fh;
        $generated++;
        print "OK:$output_path\n";
    } else {
        warn "Cannot write $output_path: $!\n";
        print "FAIL:$printer_id:$driver_id\n";
        $failed++;
    }
}

print STDERR "Batch done: generated=$generated failed=$failed\n";
exit 0;
