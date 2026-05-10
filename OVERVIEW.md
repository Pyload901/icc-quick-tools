# A/D CTF

## Game overview

Each team is given SSH root access to multiple Linux-based
virtual machines, each of them exposing only one vulnerable
challenge (service from now on) to the public. Each VM is


associated with an identifier named vulnbox_id. Each service
tries to replicate a vulnerable real application while still being
practical to use, in the most realistic way possible. Not all VMs
will be available from the beginning of the competition, with
some of them going up at a later point during the
competition, indicated by the column **Second batch** in the
table above. Services from the second batch will initially be
represented by placeholders in the scoreboard. Each service is
deployed through one or more containers. Services are
initialized by the organizers by running deploy.sh file (when
present) or by using docker compose commands.

Participants are asked to attack vulnerable services of other
teams to retrieve proofs of successful exploitation (flags). At
the same time, teams must defend vulnerable services
installed on their VMs: for example, they can patch
vulnerabilities by modifying services, to stop attackers from
accessing flags. Teams must also make sure their patches do
not break the services' functionalities so that they can always
be accessed in a legitimate (not malicious) way.

The organizers run a game system, which is made of different
components and is responsible for dispatching flags to the
vulnerable services, checking services integrity, hosting the
scoreboard and updating scores depending on flags stolen
and services integrity. A flag submission service is hosted by
the organizers as part of the game system: teams must
submit flags they steal to score points.

The organizers reserve the right to release hints in case some
challenges remain unsolved for a lot of hours. No hints are
released for already solved challenges.

## Network and setup

The game is played within the 10.0.0.0/8 subnet. Each team is
associated with a team_id and has its own vulnerable
machines located at10.6x.y.1, where x is the vulnbox_idand y
is the team_id, while players connecting to the game network
are assigned an ip in the 10.81.team_id.1/24 subnet.


The ip addresses 10.6x.0.1 and 10.6x.1.1 are assigned to the
NPC teams' (non-playing teams) vulnerable VMs. These VMs
will not be patched during the competition but their flags will
count towards the scoreboard. In contrast to classic NOP
teams, NPC teams can be used both to test exploits and to
gain points. This is to make it worth to attack a service even if
all teams patched its vulnerabilities.

TCP proxies are hosted on the router to enhance traffic
anonymization. Using NAT techniques, these proxies expose
the real service ports while transparently forwarding all traffic
to and from the actual services. The only limitations are a 2-
minute connection timeout and a rate limit of 60 connections
per minute to any service per team, excluding your own. You
can still host additional services on your vulnbox (e.g., farms,
traffic analyzers), and these will bypass the proxies but will still
have SNAT and TTL reset applied.

All vulnerable VMs are hosted by the organizers and have
enough resources in terms of CPU and memory to run the
pre-installed services.

```
Team 2
```
```
Cloud Router
```
```
VMs-NET: 10.60.0.0/14, 10.64.0.0/14, 10.68.0.0/
```
```
VPN-NET: 10.81.0.0/
```
```
10.81.2.0/
```
```
.2.1 .2.K
```
```
-------------------------------------------------------------------PROXIES FOR VULNBOX SERVICES
The source of the following traffic is rewritten to 10.254.0.1: SNAT AND TTL RESET FOR THE OTHER TRAFFIC
Player -> VM; VM -> VM; CheckSystem -> VM
```
```
Game System
```
```
Team 3
PC 1
```
```
10.81.3.0/
```
```
.3.
```
```
PCK
.3.K
```
```
Team N
PC 1
```
```
10.81.N.0/
```
```
.N.
```
```
PCK
...... .N.K
```
```
10.10.0.0/
```
```
PC 1 ... PCK ... ...
```
```
10.254.0.
Local Connectionor Internet
```
```
Team VM 0
M
Team VM 2
M
```
```
10.6M.2.
Team VM N
...... M
```
```
10.6M.N.
Team VM 1
M
```
```
Team VM 0
0
```
```
10.60.0.
Team VM 2
0
```
```
10.60.2.
...... Team VM 0 N
```
```
10.60.N.
Team VM 1
0
```
```
10.60.1.
```
```
...... ...... ...... ......
10.6M.0.1 10.6M.1.
```
```
NPC 1 NPC 2 Team 2 TeamN
```
Internet access is granted to install new software on the VMs
and on participants' laptops, if needed. Players are free to
handle their VMs however they want. Interaction between the


CTF network and remote servers (e.g., starting attacks from
cloud) is allowed, although bruteforce attacks or large
computational resources are not required to succeed at the
competition.

Teams can request to reboot one of their VMs by opening a
ticket. Teams can also request to restore it to the original state
it was when provided to them at the beginning of the game;
this operation requires more time (around 5-20 minutes) than
a reboot and therefore is allowed once per hour, by opening a
ticket.

The default SSH user for all VMs is root. Each team has its own
password that it's the same for all the team's VMs and is
communicated via email before the competition starts.

Each vulnbox already contains a public SSH key owned by the
organizers. It won't be used by the admins to interfere with
the competition, but only to provide support (push updates,
solve possible issues, ...) in case it is needed. You are free
remove it, at your own risk. The valid public key in
/root/.ssh/authorized_keysis:

ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHzYrEkPzZI+R64KOjGJlmCn

## Ticks, flagstores and game system

The game is divided into rounds (named ticks), with each
round lasting 120 seconds. During each round, a game system
bot (named the checker) adds new flags to every service.
Moreover, it checks the integrity of each service by interacting
with it and retrieving the flags through legitimate access (not
malicious).

For each service, multiple flags can be placed by the
organizers in different locations (named flagstores) such that
it is possible to access each of them only with distinct and
exclusive exploitation paths. For the purposes of the
competition, each flagstore is logically considered as a
distinct service (i.e. a distinct column on the scoreboard).
From now on, the term service will be used to refer to


flagstores. Each flagstore is associated with both a string and
a numeric identifier, that are used by the flag ID API and
encoded in the flags, respectively (see the dedicated sections
below). As regards the numeric identifier, note that this does
not necessarily matches with the vulnbox ID. For example, if
the competition features two vulnerable applications, there
will be two vulnboxes, with vulnbox_id=0 and vulnbox_id=1; if
both vulnerable applications have two flagstores each, there
will be four flagstores (services) with service_id=0,1 being on
the first vulnbox and service_id=2,3 being on the second one.

Each service can contain multiple vulnerabilities of varying
difficulty levels. By finding and exploiting each service, teams
can capture flags contained in them; flags can be
subsequently sent to the game system to obtain points.
Vulnerabilities in the services could require skills in multiple
topics to exploit them. There will not be any intended
vulnerability leading to remote code execution on the teams'
VMs.

During the last part of the competition, the scoreboard is
frozen, which means that teams are no longer able to see the
number of stolen/lost flags and their number of points.
However, the results of the check system are not hidden, as
they are essential information for the participating teams to
understand if their services are working as intended.

As introduced, the organizer's game system checks every
service at every tick to make sure it is working as intended. As
a result of these checks, a service can either be assigned an
OK or DOWN status. The service is considered DOWN if at
least one of the following checks fails:

```
PUT_FLAG : trying to put a new flag inside the service
GET_FLAG : trying to retrieve one (or more) still valid flag(s)
from the service
CHECK_SLA : checking the service legit functionalities by
interacting with them
```
Note that:


```
The PUT_FLAG check is not performed during the last
round of the competition.
The GET_FLAG check is not performed if the service does
not have any valid flag (i.e. if the PUT_FLAG check has
failed for the previous 5 ticks).
Although it does not really represent the status of a
service, an additional possible checker status is
SYSTEM_ERROR. This status is assigned to a service
whenever the checker process dies with an unhandled
exception; this should never happen, and it indicates an
error on the organizer's side. If this happens, the check is
not taken into account.
```
## Flags

A flag is a string made up of 31 uppercase alphabetic or
numeric chars, followed by a =. Each flag is matched by the
regular expression/^[A-Z0-9]{31}=$/. A flag placed inside a
service during roundR can be submitted starting from the
beginning of round R+1until the end of round R+5, so each
flag's validity lasts 10 minutes.

Each flag contains information regarding the team who owns
the flag and the round the flag was dispatched in. More
specifically, the first two characters of the flag encode the
round, the third and fourth encode the owning team ID and
the fifth and sixth encode the service numeric ID, all in base

36. For example, the following flag belongs to round 8, team
10 and service 2: 080A02AF0J07UMOPHNE00KJ48KAE28C=.

The following simple Python code can be used to decode
flags:

```
flag = "080A02AF0J07UMOPHNE00KJ48KAE28C="
tick = int(flag[0:2], 36)
team_id = int(flag[2:4], 36)
service_id = int(flag[4:6], 36)
```
Players can submit stolen flags by performing an HTTP PUT
request to the game system at [http://10.10.0.1:8080/flags.](http://10.10.0.1:8080/flags.)
The flags must be submitted as an array of strings and the


request must be JSON and contain the headerX-Team-Token
set to the team token given to the participants.

**Note:** the flag submission is rate-limited to a maximum of 30
requests per minute, and each HTTP body request is limited
to 100kB. It is suggested to collect multiple flags and send
them in batches.

A simple Python script is provided below as an example,
which submits two flag using 4242424242424242 as the team
token.

```
import requests
```
```
TEAM_TOKEN = '4242424242424242'
```
```
flags = ['AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', 'B
```
```
print(requests.put('http://10.10.0.1:8080/flags
'X-Team-Token': TEAM_TOKEN
}, json=flags).text)
```
The request will return an array of JSON objects, one for each
sent flag:

```
{
"msg": f"[{flag}] {message}",
"flag": flag,
"status": "ACCEPTED"/"DENIED"/"RESUBMIT"/"E
}
```
Where message can be:

```
ACCEPTED: flag claimed: the flag has been accepted by the
game system.
DENIED: invalid flag: the flag is invalid.
DENIED: flag is your own: the flag is valid, but it is owned
by the submitting team, so it is not worth any point.
DENIED: flag too old: the flag is valid, but it has expired
(older than 5 ticks), so it is not worth any point.
```

```
DENIED: flag already claimed: the flag has already been
successfully submitted.
DENIED: the check which dispatched this flag didn't
terminate successfully: players can get this response if
they try to submit a flag which was placed in a service, but
the checker could not verify that the dispatch operation
was indeed successful. As an example, a checker may
verify that the flag dispatch produces a success HTTP
response or some confirmation message; if a service does
not comply to this, the check is considered failed.
RESUBMIT: the flag is not active yet, wait for next
round : the flag is not ready to be accepted. As mentioned
above, a flag placed in round Rcan be submitted starting
from the beginning of the round R+1. Teams can wait for
the start of the following round to resubmit it.
ERROR: notify the organizers and retry later : an error
has occurred on the flag submission service backend.
Teams should contact the organizers and retry submitting
the flag afterwards.
```
If a request results in a status code 500, an error has occurred
while serving the request (e.g., the request is malformed, the
team token header is not valid, the game is ended). The
response body will contain a description of the error.

## Flag IDs

To facilitate the exploitation, a list of flag IDs could be
available. Flag IDs are useful information that could be
needed to extract flags. An example could be the usernames
of the accounts holding the flags. Only flag IDs for still valid
flags are available through the game APIs.

Flag ids are available athttp://10.10.0.1:8081/flagIds; you can
either get the entire set of available flag IDs or filter results by
adding one of the following query parameters to your
requests:

```
service: the string ID of the service
team: the ID of the team
round: the round the flag refers to (i.e., the flag was
dispatched by the checksystem)
```

Example: /flagIds?service=foobar&team=1&round=

Flag IDs are returned as a JSON object with the following
structure:

```
{
"foobar": {
"1": {
"5" : {
"flag_id_description": "flag_id_service
}
},
...
},
...
}
```
In the example, flag IDs are indexed by service (short)name
(foobar), team ID ( 1 ) and round number ( 5 ). A description of
the flag ID (e.g., “username”) is given for each of them
(flag_id_description).

The list of available services, their vulnbox IDs, team ids and
currently available round numbers for filtering flag IDs is
available athttp://10.10.0.1:8081/. The list of team IDs is always
available, while the list of services becomes available once
access to the VMs is given to the teams. Round numbers are
shown after the network opens.

## Scoring

Each team gains points by attacking other teams, defending
its own services and by keeping services up and running. The
total score of a team is the sum of its individual scores on each
service. The score per service is composed by three parts:

```
Attack: points for flags the team has captured from other
teams, submitted to the central game server within their
validity time frame.
Defense: points for flags other teams stole from the team,
submitted to the central game server within their validity
```

```
time frame.
SLA: percentage of availability and correct behavior of the
service. More specifically, percentage of OK ticks on the
total number of ticks.
```
Each team's score is updated at the end of each tick. Each
team starts the competition with 5000 points for each service.

For each service, the points corresponding to a stolen flag are
computed according to the following formula:

```
scale = 15 * sqrt(5)
norm = 0.
if round >= RU_START_ROUND:
norm = norm - norm * (round - RU_START_ROUND)
offense_points[flag] = scale / (1+exp((sqrt(sco
defense_points[flag] = min(score[victim][servic
```
where:

```
score[attacker][service] and score[victim][service]are
the attacker and victim teams' scores at the round the
flag was generated in.
round is round the flag was generated in.
RU_START_ROUND is the round when the Robot Uprising
phase starts.
TOTAL_ROUNDS is the total number of rounds of the
competition.
```
Note that the value of the variable norm changes between the
two AI phases of the competition. Specifically, it is set to 0.
during the Human Resistance phase and it will decrease
during the Robot Uprising phase.

The attacking team is assigned offense_points[flag] points
and the victim team loses defense_points[flag] points:

```
# Service base points
score[team][service] = 5000
```
```
# Sum offensive points
```

```
for flag in stolen_flags[team][service]:
score[team][service] += offense_points[flag]
```
```
# Substract defensive points
for flag in lost_flags[team][service]:
score[team][service] -= defense_points[flag]
```
The final team score is computed as the sum of the scores for
each service multiplied by their service SLA:

```
total_score[team] = 0
```
```
for service in services:
# Compute SLA of the service
sla[team][service] = ticks_up[team][service]
# Limit scores to 0
score[team][service] = max(0, score[team][ser
# Add service score
total_score[team] += score[team][service] * s
```
Important notes about the scoring system:

```
The SLA is not directly added to the service score, but it is
a multiplicative factor to it.
The score of a valid flag depends on the difference
between the service scores of the attacker and victim
teams.
The score of a valid flag does not directly depend on the
position of the attacker and victim teams in the
scoreboard.
The score of a valid flag is computed only depending on
the attacker and victim teams' scores at the round the
flag was generated; therefore, the score of a valid flag
never changes.
If a team steals/loses a flag at round R, then the team
score for round R+1 increases/decreases. Therefore, the
flags captured by or stolen from that team that were
```

```
generated at round R+1 are affected by the points delta
originated at round R.
Stealing flags from teams with higher service scores
values more than stealing them from teams with lower
ones.
Finding new exploits near the end of the competition is
generally more valuable thanfarming points with the
ones at the beginning.
```
## Technical and human behaviour

The following rules outline prohibited actions and expected
conduct to ensure a level playing field for all participants:

```
Collaboration with other teams is prohibited. This includes
(but it is not limited to) sharing hints, exploits or flags.
Communication with external people about the
challenges/competition is disallowed. Communication
about other topics is discouraged.
Sharing flags, exploits, solutions or writeups publicly on
the internet before the end of the competition is not
allowed.
Discussing privately about hints (with authors, organizers,
other teams' players or external people) is prohibited. This
is valid for both asking and giving hints.
Only targets on the subnets 10.60.0.0/14 and 10.64.0.0/
are considered in-scope for the competition, but players
are not allowed to escape out of the challenge containers
to attack the challenge VMs. Attacking anything outside
this specific set of allowed targets is forbidden. This
includes (but it is not limited to): anything outside the
challenge containers, other players' laptops as well as
organizers machines and game infrastructure. This also
includes social engineering, and all the actions aimed at
gaining access to other teams' or organizers' accounts or
similar scenarios.
Attacking the physical infrastructure of the venue is
prohibited. This included physically accessing racks,
servers or any other infrastructure equipment inside the
venue. Teams are not allowed to physically interact with
any device that is not on their tables.
```

```
Any action aimed at altering the behavior of a challenge
for other teams is prohibited. This includes (but it is not
limited to) DoS attacks, breaking challenges,
modifying/deleting flags, patching challenges via RCE,
installing backdoors, etc.
It is forbidden to intentionally construct traffic in a way so
it causes crashes, DoS or resource exhaustion in
monitoring tools.
Fake flags are not allowed. This includes, but is not limited
to:
Replacing a valid flag with a string that matches the
flag format, but it's not accepted by the submission
system.
Placing (in your or others' services) strings matching
the flag format that are not accepted by the
submission system.
Any other similar scenario.
All occurrences of this behavior reported by the players (or
independently observed by the organizers) can result in
penalties.
The use of automatic scanning tools, network scanners, or
any tool generating large amounts of traffic is prohibited.
Any action aimed at generating excessive load to the
contest infrastructure is not allowed. Any kind of action
resulting in DoS is not allowed (e.g. network, logical, ...).
If you are not sure if something is allowed or not, use the
ticketing system to ask before doing it. Any unfair
behavior with respect to the competition or the other
players is forbidden, even if not explicitly described in the
rules above; the organizers reserve the right to evaluate
each case independently.
If any bug or flaw is found in the infrastructure, players are
kindly asked to report it at info@cybersecnatlab.it.
Reports will be awarded with a special mention published
on the CTF platforms itself.
```
Please be aware that the entire game network traffic is
logged, and it can be accessed in case of suspected rules
violation.