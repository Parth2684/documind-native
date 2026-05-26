use std::path::PathBuf;

use infer::MatcherType;

pub enum FileType {
    Image,
    PDF,
}

pub fn get_file_type(path: &PathBuf) -> Result<FileType, String> {
    let file_type = infer::get_from_path(path).map_err(|err| err.to_string())?;

    match file_type {
        None => Err(String::from("Could not infer file type")),
        Some(filetype) => {
            if filetype.matcher_type() == MatcherType::Image {
                return Ok(FileType::Image);
            }
            if filetype.mime_type() == "application/pdf" {
                return Ok(FileType::PDF);
            } else {
                return Err(String::from("Unsupported file uploaded"));
            }
        }
    }
}
