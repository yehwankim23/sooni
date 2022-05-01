import json


def main():
    data_subjects = dict()

    for line in open("data.txt", "r").readlines():
        words = line.strip().split()

        number = words[0]
        print(number)

        subject = words[1]
        data_courses = data_subjects.get(subject)

        if data_courses is None:
            data_subjects[subject] = dict()
            data_courses = data_subjects[subject]

        course = words[2]
        data_course_info = data_courses.get(course)

        if data_course_info is None:
            data_courses[course] = dict()
            data_course_info = data_courses[course]

        data_sections = data_course_info.get("Sections")

        if data_sections is None:
            data_course_info["Sections"] = dict()
            data_sections = data_course_info["Sections"]

        title = words[3]
        sbc = "-"

        index = 4
        sbc_found = False

        while True:
            word = words[index]
            index += 1

            if word in ["LAB", "LEC", "REC", "SEM"]:
                cmp = word
                break

            if sbc_found:
                sbc += f" {word}"
            else:
                for SBC in ["Partially", "ARTS", "CER", "DIV", "ESI", "EXP+", "GLO", "HFA+", "HUM",
                            "LANG", "QPS", "SBS", "SBS+", "SNW", "SPK", "STAS", "STEM+", "TECH",
                            "USA", "WRT", "WRTD"]:
                    if SBC in word:
                        sbc_found = True
                        break

                if sbc_found:
                    sbc = word
                else:
                    title += f" {word}"

        if data_course_info.get("Title") is None:
            data_course_info["Title"] = title

        if data_course_info.get("SBC") is None:
            data_course_info["SBC"] = sbc

        section = words[index]
        index += 1

        if not section.isnumeric():
            section = section[1:]

        data_section_info = data_sections.get(section)

        if data_section_info is None:
            data_sections[section] = dict()
            data_section_info = data_sections[section]

        data_section_times = data_section_info.get("Times")

        if data_section_times is None:
            data_section_info["Times"] = dict()
            data_section_times = data_section_info["Times"]

        credit = words[index]

        if credit.isnumeric():
            index += 1
        else:
            credit = "?"

        if data_course_info.get("Credits") is None:
            data_course_info["Credits"] = credit

        days = words[index].replace("RE", "").replace("C", "")
        index += 1

        start_time = words[index]
        index += 1

        start_period = words[index]
        index += 1

        end_time = words[index]
        index += 1

        end_period = words[index]
        index += 1

        old_time = data_section_info.get("Time")
        new_time = f"{cmp}: {days} {start_time} {start_period} - {end_time} {end_period}"

        if old_time is not None:
            if new_time != old_time:
                new_time = f"{old_time}<br />{new_time}"

        data_section_info["Time"] = new_time
        start_time = float(f"{start_time[:-3]}.{start_time[-2:]}")

        if start_period == "PM" and start_time < 12:
            start_time += 12

        end_time = float(f"{end_time[:-3]}.{end_time[-2:]}")

        if end_period == "PM" and end_time < 12:
            end_time += 12

        for day in ["M", "TU", "W", "TH", "F"]:
            if day in days:
                data_times_m = data_section_times.get(day)

                if data_times_m is None:
                    data_section_times[day] = dict()
                    data_times_m = data_section_times[day]

                data_times_m[start_time] = end_time

        room = words[index]

        if room[1:].isnumeric():
            index += 1
        else:
            room = "-"

        data_section_info_room = data_section_info.get("Room")

        if data_section_info_room is None:
            data_section_info["Room"] = room
        elif data_section_info_room != room:
            data_section_info["Room"] = f"{data_section_info_room}<br />{room}"

        instructor = " ".join(words[index:len(words)])
        data_section_info["Instructor"] = instructor

        if data_section_info.get("Number") is None:
            data_section_info["Number"] = number

    data_js = open("../scripts/data.js", "w")
    data_js.write("const subjects = " + json.dumps(data_subjects, indent=2) + "\n")
    data_js.close()


if __name__ == "__main__":
    main()
