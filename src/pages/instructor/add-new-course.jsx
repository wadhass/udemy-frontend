import CourseCurriculum from "@/components/instructor-view/courses/add-new-course/course-curriculum";
import CourseLanding from "@/components/instructor-view/courses/add-new-course/course-landing";
import CourseSettings from "@/components/instructor-view/courses/add-new-course/course-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import {
  createAdminCourseService,
  fetchAdminCourseDetailsService,
  updateAdminCourseService,
} from "@/services";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AddNewCoursePage() {
  const {
    courseLandingFormData,
    courseCurriculumFormData,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
    currentEditedCourseId,
    setCurrentEditedCourseId,
  } = useContext(InstructorContext);

  const navigate = useNavigate();
  const params = useParams();
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return value === "" || value === null || value === undefined;
  }

  function validateFormData() {
    for (const key in courseLandingFormData) {
      if (isEmpty(courseLandingFormData[key])) {
        return false;
      }
    }

    let hasFreePreview = false;

    for (const item of courseCurriculumFormData) {
      if (
        isEmpty(item.title) ||
        isEmpty(item.videoUrl) ||
        isEmpty(item.public_id)
      ) {
        return false;
      }

      if (item.freePreview) {
        hasFreePreview = true; //found at least one free preview
      }
    }

    return hasFreePreview;
  }

  async function handleCreateCourse() {
    setFormError("");
    setSaving(true);
    const courseFinalFormData = {
      date: new Date(),
      ...courseLandingFormData,
      students: [],
      curriculum: courseCurriculumFormData,
      isPublised: true,
    };

    try {
      const response = currentEditedCourseId
        ? await updateAdminCourseService(
            currentEditedCourseId,
            courseFinalFormData
          )
        : await createAdminCourseService(courseFinalFormData);

      if (!response?.success) {
        throw new Error(response?.message || "The course could not be saved.");
      }
      setCourseLandingFormData(courseLandingInitialFormData);
      setCourseCurriculumFormData(courseCurriculumInitialFormData);
      setCurrentEditedCourseId(null);
      navigate("/admin");
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message ||
          requestError.message ||
          "The course could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  const fetchCurrentCourseDetails = useCallback(async () => {
    setFormError("");
    try {
      const response = await fetchAdminCourseDetailsService(
        currentEditedCourseId
      );

      if (!response?.success) {
        throw new Error(response?.message || "The course could not be loaded.");
      }

      const setCourseFormData = Object.keys(
        courseLandingInitialFormData
      ).reduce((acc, key) => {
        acc[key] =
          response?.data[key] ?? courseLandingInitialFormData[key];

        return acc;
      }, {});

      setCourseLandingFormData(setCourseFormData);
      setCourseCurriculumFormData(response?.data?.curriculum || []);
    } catch (requestError) {
      setFormError(
        requestError?.response?.data?.message ||
          requestError.message ||
          "The course could not be loaded."
      );
    }
  }, [
    currentEditedCourseId,
    setCourseCurriculumFormData,
    setCourseLandingFormData,
  ]);

  useEffect(() => {
    if (currentEditedCourseId) fetchCurrentCourseDetails();
  }, [currentEditedCourseId, fetchCurrentCourseDetails]);

  useEffect(() => {
    if (params?.courseId) {
      setCurrentEditedCourseId(params.courseId);
    } else {
      setCurrentEditedCourseId(null);
      setCourseLandingFormData(courseLandingInitialFormData);
      setCourseCurriculumFormData(courseCurriculumInitialFormData);
    }
  }, [
    params?.courseId,
    setCourseCurriculumFormData,
    setCourseLandingFormData,
    setCurrentEditedCourseId,
  ]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between">
        <h1 className="text-3xl font-extrabold mb-5">
          {params?.courseId ? "Edit course" : "Create a new course"}
        </h1>
        <Button
          disabled={!validateFormData() || saving}
          className="text-sm tracking-wider font-bold px-8"
          onClick={handleCreateCourse}
        >
          {saving ? "SAVING..." : "SAVE COURSE"}
        </Button>
      </div>
      {formError ? (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {formError}
        </div>
      ) : null}
      <Card>
        <CardContent>
          <div className="container mx-auto p-4">
            <Tabs defaultValue="curriculum" className="space-y-4">
              <TabsList>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="course-landing-page">
                  Course Landing Page
                </TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="curriculum">
                <CourseCurriculum />
              </TabsContent>
              <TabsContent value="course-landing-page">
                <CourseLanding />
              </TabsContent>
              <TabsContent value="settings">
                <CourseSettings />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddNewCoursePage;
