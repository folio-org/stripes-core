#!/usr/bin/perl -w

#
# find unused dependencies in package.json file given as STDIN
#
# usage: $0 < package.json
#

use strict;

my @deps = ();
my $flag = 0;
while (<>) {
    if (/^\s*"dependencies"/) {
        $flag = 1;
        next;
    }
    if ($flag) {
        if (/^\s*"([^\s]+)": ".*",?/) {
            push @deps, $1;
        }
        else {
            last;
        }
    }
}

my $x = 0;
foreach my $k (sort @deps) {
    my $cruft = system("grep -rqi $k . --exclude-dir node_modules --exclude-dir .git --exclude yarn.lock --exclude package.json");
    $cruft && ($x = $cruft) && print "    $k\n";
}

exit($x >> 8);
