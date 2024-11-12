import React from "react";
import { Form, json, redirect, useActionData } from "react-router-dom";
import { getAuthToken } from "../util/auth";
function AddDoctor() {
    const data = useActionData();
  return (
    <div className="form-container">
      <h2 className="form-title">Add Doctor</h2>
      {data && data.message && <p>{data.message}</p>}
      <Form method="post" encType="multipart/form-data">
      <input type="file" name="file" required />
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Your name
          </label>
          <input
            className="form-input"
            type="text"
            id="name"
            name="name"
            placeholder="Dr. Jeffrey Williams"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Doctor Email
          </label>
          <input
            className="form-input"
            type="email"
            id="email"
            name="email"
            placeholder="jeffrey@greatstack.dev"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Set Password
          </label>
          <input
            className="form-input"
            type="password"
            id="password"
            name="password"
            placeholder="********"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="experience">
            Experience
          </label>
          <input
            className="form-input"
            type="text"
            id="experience"
            name="experience"
            placeholder="5 Years"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="speciality">
            Speciality
          </label>
          <select className="form-select" id="speciality" name="speciality">
            <option>General physician</option>
            {/* Add other options as needed */}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="degree">
            Degree
          </label>
          <input
            className="form-input"
            type="text"
            id="degree"
            name="degree"
            placeholder="MBBS"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="address">
            Address
          </label>
          <input
            className="form-input"
            type="text"
            id="address"
            name="address"
            placeholder="AECS Layout, Whitefield"
          />
         
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="fees">
            Fees
          </label>
          <input
            className="form-input"
            type="number"
            id="fees"
            name="fees"
            placeholder="5"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="about">
            About Doctor
          </label>
          <textarea
            className="form-textarea"
            id="about"
            name="about"
            placeholder="write about doctor"
          />
        </div>
        <button type="submit">Submit</button>
      </Form>
    </div>
  );
}

export const action = async ({request}) => {
    const data = await request.formData();
    const token = getAuthToken();
    const response = await fetch("http://localhost:3000/add-doctor",{
        method:"POST",
        headers:{
            'Authorization': token
        },
        body:data
    })

    if(!response.ok){
        throw json({message:"Unable to add"},{status:404});
    }

    if(response.status === 400 || response.status === 500){
        return response;
    }

    return redirect("/admin/all-doctors");
}

export default AddDoctor;
