const panel = document.querySelector("#panel");

function showErrorMessage(selectedClass) {
  panel.innerHTML = `<p>"${selectedClass}" not found.</p>`;
  panel.classList.remove("d-n");
}

function toMap(object) {
  return new Map(Object.entries(object));
}

const subjectsMap = toMap(subjects);

function submit() {
  panel.classList.add("d-n");

  const selectedClasses = document.querySelector("textarea").value.trim().split(" ");

  let selectedTimes = new Map([
    ["M", new Map()],
    ["TU", new Map()],
    ["W", new Map()],
    ["TH", new Map()],
    ["F", new Map()],
  ]);

  for (let i = 0; i < selectedClasses.length; i++) {
    const selectedClass = selectedClasses[i];

    if (selectedClass === "") {
      continue;
    }

    if (selectedClass.length !== 9) {
      showErrorMessage(selectedClass);
      return;
    }

    const selectedClassToUpperCase = selectedClass.toUpperCase();
    const selectedSubject = selectedClassToUpperCase.slice(0, 3);
    const selectedCourse = selectedClassToUpperCase.slice(3, 6);
    const selectedSection = selectedClassToUpperCase.slice(7, 9);

    if (!subjectsMap.has(selectedSubject)) {
      showErrorMessage(selectedClass);
      return;
    }

    const coursesMap = toMap(subjectsMap.get(selectedSubject));

    if (!coursesMap.has(selectedCourse)) {
      showErrorMessage(selectedClass);
      return;
    }

    const sectionsMap = toMap(toMap(coursesMap.get(selectedCourse)).get("Sections"));

    if (!sectionsMap.has(selectedSection)) {
      showErrorMessage(selectedClass);
      return;
    }

    toMap(toMap(sectionsMap.get(selectedSection)).get("Times")).forEach((time, day) => {
      const selectedDay = selectedTimes.get(day);

      toMap(time).forEach((endTime, startTime) => {
        const startTimeNumber = Number(startTime);

        selectedDay.set(
          startTimeNumber,
          selectedDay.has(startTimeNumber)
            ? Math.max(endTime, selectedDay.get(startTimeNumber))
            : endTime
        );
      });
    });
  }

  let innerHTML = `
    <tr class="suny-blue">
      <th>Number</th>
      <th>Subject</th>
      <th>Course</th>
      <th>Title</th>
      <th>SBC</th>
      <th>Section</th>
      <th>Credits</th>
      <th>Time</th>
      <th>Room</th>
      <th>Instructor</th>
    </tr>
  `;

  document.querySelectorAll("input").forEach((input) => {
    if (input.checked) {
      const subject = input.id.toUpperCase();

      toMap(subjectsMap.get(subject)).forEach((courseInfo, course) => {
        const courseInfoMap = toMap(courseInfo);

        toMap(courseInfoMap.get("Sections")).forEach((sectionInfo, section) => {
          const sectionInfoMap = toMap(sectionInfo);
          let conflict = false;

          toMap(sectionInfoMap.get("Times")).forEach((time, day) => {
            toMap(time).forEach((endTime, startTime) => {
              const startTimeNumber = Number(startTime);

              selectedTimes.get(day).forEach((selectedEndTime, selectedStartTime) => {
                if (
                  (selectedStartTime <= startTimeNumber && startTime <= selectedEndTime) ||
                  (selectedStartTime <= endTime && endTime <= selectedEndTime) ||
                  (startTimeNumber <= selectedStartTime && selectedEndTime <= endTime)
                ) {
                  conflict = true;
                  return;
                }
              });

              if (conflict) {
                return;
              }
            });

            if (conflict) {
              return;
            }
          });

          if (!conflict) {
            innerHTML += `
              <tr>
                <td>${sectionInfoMap.get("Number")}</td>
                <td>${subject}</td>
                <td>${course}</td>
                <td>${courseInfoMap.get("Title")}</td>
                <td>${courseInfoMap.get("SBC")}</td>
                <td>${section}</td>
                <td>${courseInfoMap.get("Credits")}</td>
                <td>${sectionInfoMap.get("Time")}</td>
                <td>${sectionInfoMap.get("Room")}</td>
                <td>${sectionInfoMap.get("Instructor")}</td>
              </tr>
            `;
          }
        });
      });
    }
  });

  subjectsMap.forEach((courses, subject) => {
    if (["AMS", "ACC", "BUS", "CSE", "ESE", "EST", "MEC"].includes(subject)) {
      return;
    }

    toMap(courses).forEach((courseInfo, course) => {
      const courseInfoMap = toMap(courseInfo);

      toMap(courseInfoMap.get("Sections")).forEach((sectionInfo, section) => {
        const sectionInfoMap = toMap(sectionInfo);
        let conflict = false;

        toMap(sectionInfoMap.get("Times")).forEach((time, day) => {
          toMap(time).forEach((endTime, startTime) => {
            const startTimeNumber = Number(startTime);

            selectedTimes.get(day).forEach((selectedEndTime, selectedStartTime) => {
              if (
                (selectedStartTime <= startTimeNumber && startTime <= selectedEndTime) ||
                (selectedStartTime <= endTime && endTime <= selectedEndTime) ||
                (startTimeNumber <= selectedStartTime && selectedEndTime <= endTime)
              ) {
                conflict = true;
                return;
              }
            });

            if (conflict) {
              return;
            }
          });

          if (conflict) {
            return;
          }
        });

        if (!conflict) {
          innerHTML += `
            <tr>
              <td>${sectionInfoMap.get("Number")}</td>
              <td>${subject}</td>
              <td>${course}</td>
              <td>${courseInfoMap.get("Title")}</td>
              <td>${courseInfoMap.get("SBC")}</td>
              <td>${section}</td>
              <td>${courseInfoMap.get("Credits")}</td>
              <td>${sectionInfoMap.get("Time")}</td>
              <td>${sectionInfoMap.get("Room")}</td>
              <td>${sectionInfoMap.get("Instructor")}</td>
            </tr>
          `;
        }
      });
    });
  });

  document.querySelector("#table").innerHTML = innerHTML;
}

document.querySelector("button").addEventListener("click", () => {
  submit();
});

submit();
