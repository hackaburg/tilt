<p align="center"><img src="https://ratisbona-coding.org/_app/immutable/assets/hackaburg.5f0e95a3.svg" width=100/></p>

# tilt

[![Docker Image Size (latest)](https://img.shields.io/docker/image-size/hackaburg/tilt/latest)](https://hub.docker.com/r/hackaburg/tilt)
[![codecov](https://codecov.io/gh/hackaburg/tilt/branch/main/graph/badge.svg)](https://codecov.io/gh/hackaburg/tilt)
[![David](https://img.shields.io/david/hackaburg/tilt)](https://github.com/hackaburg/tilt)
[![GitHub license](https://img.shields.io/github/license/hackaburg/tilt.svg)](https://github.com/hackaburg/tilt/LICENSE)

Hackathon Registration System

- [Documentation](docs/docs.md)
- [Docker Development Quickstart](docs/docker-development.md)

Like many other hackathons, we previously used [Quill](https://github.com/techx/quill) for our application process, which worked really well for us in the past. Especially Quill's process was a blessing: an application consists of two steps, the profile creation and, once an attendee was admitted to the event, the spot confirmation. We attended different events that used different processes and found this to be easy for both the attendees and organizers.

Faced with maintaining our [fork](https://github.com/hackaburg/quill) with our set of changes to the application process, as well as maintaining an Angular.JS frontend and an untyped Express backend, we wanted to build a registration system  ourselves, that matched our needs on a tech stack we're more familiar with.
